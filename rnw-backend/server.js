// ==================== IMPORTS ====================
import express from "express";
import cors from "cors";
import db from "./db.js"; // ✅ uses central db connection (via Pool)
import geminiRoutes from "./routes/gemini.js";
import bodyweightBookingsRouter from "./routes/bodyweightBookings.js";

const app = express();
app.use(cors());
app.use(express.json());

// ==================== EQUIPMENT MAPS ====================
const EQUIPMENT_MAP = {
  1: "Chest Press",
  2: "Incline Bench",
  3: "Lat Pulldown",
  4: "Seated Row",
  5: "Leg Press",
  6: "Squat Rack",
  7: "Bicep Curl",
  8: "Tricep Pushdown",
  9: "Shoulder Press",
  10: "Lateral Raise Machine",
  11: "Treadmill",
  12: "Elliptical"
};

const EQUIPMENT_TO_ZONE = {
  "Treadmill": "Treadmills",
  "Elliptical": "Ellipticals",
  "Chest Press Machine": "Chest Press",
  "Leg Press": "Leg Press",
  "Lat Pulldown": "Lat Pulldown",
  "Squat Rack": "Squat Rack",
  "Bicep Curl Machine": "Bicep Curl",
  "Incline Bench": "Chest Press",
  "Seated Row": "Lat Pulldown",
  "Tricep Pushdown": "Calisthenics Area",
  "Shoulder Press": "Dumbbell Area",
  "Lateral Raise Machine": "Dumbbell Area"
};

// ==================== ROUTES ====================
app.use("/api/gemini", geminiRoutes);
app.use("/api/bodyweightBookings", bodyweightBookingsRouter);

// ==================== BASIC DATA ====================
app.get("/api/muscle-groups", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM muscle_groups ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/equipment/:groupId", async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM equipment WHERE muscle_group_id = $1 ORDER BY id",
      [groupId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/time-slots", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM time_slots ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ==================== BOOKINGS ====================
app.get("/api/bookings", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM bookings WHERE done = false");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ FIXED: use db.query instead of pool.query
app.get("/api/bodyweight-bookings", async (req, res) => {
  const { user_id } = req.query;
  try {
    const result = await db.query(
      "SELECT * FROM bodyweight_bookings WHERE user_id = $1 ORDER BY created_at DESC",
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching bodyweight bookings:", err);
    res.status(500).json({ error: "Failed to fetch bodyweight bookings" });
  }
});

app.post("/api/bookings", async (req, res) => {
  const { equipment_id, time_slot_id, user_id } = req.body;
  const uid = user_id || 1;
  try {
    const result = await db.query(
      "INSERT INTO bookings (equipment_id, time_slot_id, done, user_id) VALUES ($1,$2,false,$3) RETURNING *",
      [equipment_id, time_slot_id, uid]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "UPDATE bookings SET done = true WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found or already done" });
    }
    const booking = result.rows[0];
    await db.query(
      `INSERT INTO booking_history (booking_id, user_id, equipment_id, time_slot_id, done, date)
       VALUES ($1, $2, $3, $4, true, NOW())`,
      [booking.id, booking.user_id, booking.equipment_id, booking.time_slot_id]
    );
    res.json(booking);
  } catch (err) {
    console.error("PUT /api/bookings/:id error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM bookings WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    console.error("DELETE /api/bookings/:id error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ==================== DASHBOARD ====================
app.get("/api/dashboard", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.id, b.user_id, b.equipment_id, e.name AS equipment_name, t.slot AS time_slot, b.done, 'active' AS status
      FROM bookings b
      LEFT JOIN equipment e ON b.equipment_id = e.id
      LEFT JOIN time_slots t ON b.time_slot_id = t.id
      UNION ALL
      SELECT h.booking_id AS id, h.user_id, h.equipment_id, e.name AS equipment_name, t.slot AS time_slot, h.done, 'history' AS status
      FROM booking_history h
      LEFT JOIN equipment e ON h.equipment_id = e.id
      LEFT JOIN time_slots t ON h.time_slot_id = t.id
      ORDER BY id DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ==================== HEATMAP ====================
app.get("/api/heatmap-data", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT zone_name, current_bookings AS count FROM gym_map ORDER BY zone_id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/heatmap-data error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ==================== START SERVER ====================
app.listen(process.env.PORT || 5001, () =>
  console.log(`✅ Server running on port ${process.env.PORT || 5001}`)
);

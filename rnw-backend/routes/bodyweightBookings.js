import express from "express";
import pool from "../db.js"; // ✅ your PostgreSQL connection pool (same as used for bookings.js)

const router = express.Router();

/**
 * ✅ Add a bodyweight (non-equipment) exercise booking
 * Request body:
 * {
 *   "user_id": "uid123",
 *   "time_slot_id": 5,
 *   "exercise_name": "Push-ups"
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { user_id, time_slot_id, exercise_name } = req.body;

    if (!user_id || !time_slot_id || !exercise_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const insertQuery = `
      INSERT INTO bodyweight_bookings (user_id, time_slot_id, exercise_name)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [user_id, time_slot_id, exercise_name]);

    res.status(201).json({
      message: "Bodyweight exercise added successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Error inserting bodyweight booking:", error);
    res.status(500).json({ error: "Failed to save bodyweight booking" });
  }
});

/**
 * ✅ Get all bodyweight bookings (admin view)
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bodyweight_bookings ORDER BY created_at DESC;"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching bodyweight bookings:", error);
    res.status(500).json({ error: "Failed to fetch bodyweight bookings" });
  }
});

/**
 * ✅ Get bodyweight bookings for a specific user (for dashboard)
 * Example: GET /api/bodyweightBookings/user/uid123
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      "SELECT * FROM bodyweight_bookings WHERE user_id = $1 ORDER BY created_at DESC;",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching user bodyweight bookings:", error);
    res.status(500).json({ error: "Failed to fetch user's bodyweight bookings" });
  }
});

/**
 * ✅ Mark a bodyweight booking as done
 */
router.put("/:id/done", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE bodyweight_bookings SET done = TRUE WHERE id = $1;", [id]);
    res.json({ message: "Marked as done" });
  } catch (error) {
    console.error("Error updating bodyweight booking:", error);
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

/**
 * ✅ Delete a bodyweight booking
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM bodyweight_bookings WHERE id = $1;", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting bodyweight booking:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

export default router;

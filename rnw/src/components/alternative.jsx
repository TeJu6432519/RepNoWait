import React, { useState, useEffect } from "react";
import axios from "axios";
import "./equipment.css";

// ✅ Your existing data
const exercisesData = {
  Chest: {
    equipment: ["Chest Press Machine", "Incline Bench"],
    bodyweight: ["Push-ups", "Dumbbell Fly", "Incline Push-ups"],
  },
  Back: {
    equipment: ["Lat Pulldown", "Seated Row"],
    bodyweight: ["Pull-ups", "Dumbbell Rows", "Resistance Band Rows"],
  },
  Legs: {
    equipment: ["Leg Press", "Squat Rack"],
    bodyweight: ["Lunges", "Bodyweight Squats", "Step-ups"],
  },
  Arms: {
    equipment: ["Bicep Curl Machine", "Tricep Pushdown"],
    bodyweight: ["Bicep Curls (Dumbbell)", "Tricep Dips", "Hammer Curls"],
  },
  Shoulders: {
    equipment: ["Shoulder Press", "Lateral Raise Machine"],
    bodyweight: ["Lateral Raises", "Front Raises", "Overhead Press (Dumbbell)"],
  },
  Cardio: {
    equipment: ["Treadmill", "Elliptical"],
    bodyweight: ["Jump Rope", "Stationary Bike", "High Knees"],
  },
};

// ✅ Equipment ID Map
const EQUIPMENT_ID_MAP = {
  "Chest Press Machine": 1,
  "Incline Bench": 2,
  "Lat Pulldown": 3,
  "Seated Row": 4,
  "Leg Press": 5,
  "Squat Rack": 6,
  "Bicep Curl Machine": 7,
  "Tricep Pushdown": 8,
  "Shoulder Press": 9,
  "Lateral Raise Machine": 10,
  "Treadmill": 11,
  "Elliptical": 12,
};

// ✅ Time Slot Map
const TIME_SLOT_ID_MAP = {
  "6:0": 1,
  "6:15": 2,
  "6:30": 3,
  "6:45": 4,
  "7:0": 5,
  "7:15": 6,
  "7:30": 7,
  "7:45": 8,
  "8:0": 9,
  "8:15": 10,
  "8:30": 11,
  "8:45": 12,
};

const Alternative = ({ altWorkoutData, bookings, setBookings }) => {
  const [equipmentSuggestions, setEquipmentSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: AI state
  const [aiAlternatives, setAiAlternatives] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // ✅ Local bodyweight state (so we can remove accepted/rejected ones)
  const [bodyweightExercises, setBodyweightExercises] = useState([]);

  // ✅ Fetch available equipment
  useEffect(() => {
    const fetchAvailable = async () => {
      if (!altWorkoutData?.selectedGroup) return;
      setLoading(true);

      const { selectedGroup, selectedHour, selectedSlot } = altWorkoutData;
      const groupExercises = exercisesData[selectedGroup]?.equipment || [];

      try {
        const res = await axios.get("http://localhost:5001/api/bookings");
        const activeBookings = res.data;
        const slotKey = `${selectedHour}:${selectedSlot}`;

        const suggestions = groupExercises.map((eq) => {
          const booked = activeBookings.some(
            (b) =>
              b.equipment_id === EQUIPMENT_ID_MAP[eq] &&
              !b.done &&
              b.time_slot_id === TIME_SLOT_ID_MAP[slotKey]
          );
          return {
            name: eq,
            type: "equipment",
            available: !booked,
          };
        });

        setEquipmentSuggestions(suggestions);

        // Also set local bodyweight list
        setBodyweightExercises(exercisesData[selectedGroup]?.bodyweight || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailable();
  }, [altWorkoutData]);

  // ✅ NEW: Fetch Gemini AI alternatives
  useEffect(() => {
    const fetchAIAlternatives = async () => {
      if (!altWorkoutData?.selectedGroup) return;
      setAiLoading(true);
      try {
        const res = await axios.post("http://localhost:5001/api/gemini/alternatives", {
          muscleGroup: altWorkoutData.selectedGroup,
        });
        setAiAlternatives(res.data || []);
      } catch (err) {
        console.error("Failed to fetch AI alternatives:", err);
      } finally {
        setAiLoading(false);
      }
    };

    fetchAIAlternatives();
  }, [altWorkoutData]);

  // ✅ Accept handler (supports equipment + AI + static bodyweight)
const handleAccept = async (eq, type = "equipment") => {
  if (!altWorkoutData) {
    alert("Missing workout data.");
    return;
  }

  const { selectedHour, selectedSlot, userId } = altWorkoutData;
  const slotKey = `${selectedHour}:${selectedSlot}`;
  const timeSlotId = TIME_SLOT_ID_MAP[slotKey];

  if (!timeSlotId) {
    console.error("❌ Invalid time slot:", slotKey);
    alert("Invalid time slot. Please select a valid slot.");
    return;
  }

  // Choose correct API endpoint
  const endpoint =
    type === "bodyweight"
      ? "http://localhost:5001/api/bodyweightBookings"
      : "http://localhost:5001/api/bookings";

  // Build request payload
  const payload =
    type === "bodyweight"
      ? {
          user_id: userId || 1,
          time_slot_id: timeSlotId,
          exercise_name: eq.name,
        }
      : {
          equipment_id: EQUIPMENT_ID_MAP[eq.name],
          time_slot_id: timeSlotId,
          user_id: userId || 1,
        };

  console.log("📦 Sending booking:", { endpoint, payload, type });

  try {
    const res = await axios.post(endpoint, payload);
      alert(`${eq.name} added to your dashboard!`);

      // ✅ Update dashboard state instantly
      setBookings((prev) => [
        ...prev,
        {
          id: res.data?.id || Math.random(), // use backend ID if available
          equipment_id:
            type === "bodyweight" ? null : EQUIPMENT_ID_MAP[eq.name],
          time_slot_id: timeSlotId,
          exercise_name: type === "bodyweight" ? eq.name : null,
          done: false,
          date: new Date().toISOString().split("T")[0],
        },
      ]);


    // Update UI lists
    if (type === "equipment") {
      setEquipmentSuggestions((prev) =>
        prev.filter((e) => e.name !== eq.name)
      );
    } else if (type === "bodyweight") {
      setBodyweightExercises((prev) =>
        prev.filter((e) => e !== eq.name)
      );
    } else {
      setAiAlternatives((prev) =>
        prev.filter((e) => e.name !== eq.name)
      );
    }
  } catch (err) {
    console.error("❌ Booking failed:", err.response?.data || err.message);
    alert("Failed to book exercise. Try again.");
  }
};


  const handleReject = (eq, type = "equipment") => {
    if (type === "equipment")
      setEquipmentSuggestions((prev) => prev.filter((e) => e.name !== eq.name));
    else if (type === "bodyweight")
      setBodyweightExercises((prev) => prev.filter((e) => e !== eq.name));
    else setAiAlternatives((prev) => prev.filter((e) => e.name !== eq.name));
  };

  if (!altWorkoutData?.selectedGroup) {
    return (
      <div className="equipment-page">
        <div className="equipment-main-card">
          <h3>No Alternative Selected</h3>
          <p>Select a time slot for an unavailable equipment to see alternatives.</p>
        </div>
      </div>
    );
  }

  const { selectedGroup, selectedHour, selectedSlot } = altWorkoutData;

  return (
    <div className="equipment-page">
      <div className="equipment-main-card">
        <h2>Alternative Workout Plan</h2>
        <p>
          Muscle Group: <strong>{selectedGroup}</strong>
        </p>
        <p>
          Time Slot:{" "}
          <strong>
            {selectedHour}:{selectedSlot.toString().padStart(2, "0")}
          </strong>
        </p>

        {loading && <p>Loading available equipment...</p>}

        {!loading && equipmentSuggestions.length > 0 && (
          <>
            <h3>Equipment Suggestions:</h3>
            <div className="exercise-grid">
              {equipmentSuggestions.map((eq, idx) => (
                <div
                  key={idx}
                  className={`exercise-card ${
                    eq.available ? "equipment-available" : "equipment-exercise"
                  }`}
                >
                  <strong>{eq.name}</strong>
                  <div style={{ marginTop: "0.5rem" }}>
                    <button
                      className="accept-btn"
                      disabled={!eq.available}
                      onClick={() => handleAccept(eq, "equipment")}
                    >
                      Accept
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleReject(eq, "equipment")}
                    >
                      Reject
                    </button>
                  </div>
                  {!eq.available && (
                    <small style={{ color: "#fff", opacity: 0.7 }}>Unavailable</small>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ✅ Static Bodyweight Exercises with Accept/Reject */}
        {bodyweightExercises.length > 0 && (
          <>
            <h3 style={{ marginTop: "1rem" }}>Bodyweight / No-equipment Exercises:</h3>
            <div className="exercise-grid">
              {bodyweightExercises.map((bw, idx) => (
                <div key={idx} className="exercise-card bodyweight-exercise">
                  <strong>{bw}</strong>
                  <div style={{ marginTop: "0.5rem" }}>
                    <button
                      className="accept-btn"
                      onClick={() => handleAccept({ name: bw }, "bodyweight")}
                    >
                      Accept
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleReject({ name: bw }, "bodyweight")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ✅ AI ALTERNATIVES SECTION */}
        {aiLoading && <p>Loading AI alternatives...</p>}
        {!aiLoading && aiAlternatives.length > 0 && (
          <>
            <h3 style={{ marginTop: "1rem" }}>AI Suggested Alternatives:</h3>
            <div className="exercise-grid">
              {aiAlternatives.map((ex, idx) => (
                <div key={idx} className="exercise-card bodyweight-exercise">
                  <strong>{ex.name}</strong>
                  <p style={{ fontSize: "0.85rem" }}>{ex.description}</p>
                  {ex.youtubeLink && (
                    <a
                      href={ex.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        color: "#00e0ff",
                        marginBottom: "0.5rem",
                        textDecoration: "underline",
                      }}
                    >
                      ▶ Watch Tutorial
                    </a>
                  )}
                  <div>
                    <button
                      className="accept-btn"
                      onClick={() => handleAccept(ex, "bodyweight")}
                    >
                      Accept
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleReject(ex, "bodyweight")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Alternative;

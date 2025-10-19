import React, { useState, useEffect } from "react";
import axios from "axios";
import "./equipment.css";

// Exercises per muscle group
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

// Map equipment names to DB ids
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

// Map hour/slot to time_slot_id in DB (example)
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
  // add all your slots here...
};

const Alternative = ({ altWorkoutData }) => {
  const [equipmentSuggestions, setEquipmentSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailable = async () => {
      if (!altWorkoutData?.selectedGroup) return;
      setLoading(true);

      const { selectedGroup, selectedHour, selectedSlot } = altWorkoutData;
      const groupExercises = exercisesData[selectedGroup]?.equipment || [];

      try {
        // Fetch all current bookings
        const res = await axios.get("http://localhost:5001/api/bookings");
        const activeBookings = res.data;

        const slotKey = `${selectedHour}:${selectedSlot}`;

        // Map equipment to availability
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
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailable();
  }, [altWorkoutData]);

  const handleAccept = async (eq) => {
    if (!altWorkoutData) return;
    const { selectedHour, selectedSlot, userId } = altWorkoutData;

    const slotKey = `${selectedHour}:${selectedSlot}`;

    try {
      await axios.post("http://localhost:5001/api/bookings", {
        equipment_id: EQUIPMENT_ID_MAP[eq.name],
        time_slot_id: TIME_SLOT_ID_MAP[slotKey],
        user_id: userId || 1,
      });

      setEquipmentSuggestions((prev) => prev.filter((e) => e.name !== eq.name));
      alert(`${eq.name} booked successfully!`);
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Failed to book equipment. It might be unavailable.");
    }
  };

  const handleReject = (eq) => {
    setEquipmentSuggestions((prev) => prev.filter((e) => e.name !== eq.name));
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
  const groupExercises = exercisesData[selectedGroup] || { equipment: [], bodyweight: [] };

  return (
    <div className="equipment-page">
      <div className="equipment-main-card">
        <h2>Alternative Workout Plan</h2>
        <p>
          Muscle Group: <strong>{selectedGroup}</strong>
        </p>
        <p>
          Time Slot: <strong>{selectedHour}:{selectedSlot.toString().padStart(2, "0")}</strong>
        </p>

        {loading && <p>Loading available equipment...</p>}

        {!loading && equipmentSuggestions.length > 0 && (
          <>
            <h3>Equipment Suggestions:</h3>
            <div className="exercise-grid">
              {equipmentSuggestions.map((eq, idx) => (
                <div
                  key={idx}
                  className={`exercise-card ${eq.available ? "equipment-available" : "equipment-exercise"}`}
                >
                  <strong>{eq.name}</strong>
                  <div style={{ marginTop: "0.5rem" }}>
                    <button
                      className="accept-btn"
                      disabled={!eq.available}
                      onClick={() => handleAccept(eq)}
                    >
                      Accept
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleReject(eq)}
                    >
                      Reject
                    </button>
                  </div>
                  {!eq.available && <small style={{ color: "#fff", opacity: 0.7 }}>Unavailable</small>}
                </div>
              ))}
            </div>
          </>
        )}

        {groupExercises.bodyweight.length > 0 && (
          <>
            <h3 style={{ marginTop: "1rem" }}>Bodyweight / No-equipment Exercises:</h3>
            <div className="exercise-grid">
              {groupExercises.bodyweight.map((bw, idx) => (
                <div key={idx} className="exercise-card bodyweight-exercise">
                  <strong>{bw}</strong>
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

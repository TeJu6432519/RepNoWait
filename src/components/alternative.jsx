import React, { useState } from "react";
import "./equipment.css"; // reuse existing equipment styles

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

const toMinutes = (hour, minute) => hour * 60 + minute;

const Alternative = ({ altWorkoutData, bookings, setBookings, setAltWorkoutData }) => {
  const [equipmentSuggestions, setEquipmentSuggestions] = useState(() => {
    if (!altWorkoutData) return [];

    const { selectedGroup, selectedHour, selectedSlot } = altWorkoutData;
    const groupExercises = exercisesData[selectedGroup] || { equipment: [], bodyweight: [] };

    return groupExercises.equipment.map((eq) => ({
      name: eq,
      type: "equipment",
      available: !bookings.some(
        (b) =>
          b.equipment === eq &&
          !b.done &&
          toMinutes(b.hour, b.minute) === toMinutes(selectedHour, selectedSlot)
      ),
    }));
  });

  if (!altWorkoutData || !altWorkoutData.selectedGroup) {
    return (
      <div className="equipment-page">
        <div className="equipment-main-card">
          <h3 className="page-title">No Alternative Selected</h3>
          <p>
            Go to the Equipment tab, select an unavailable slot, and click "Generate
            Alternative".
          </p>
        </div>
      </div>
    );
  }

  const { selectedGroup, selectedHour, selectedSlot } = altWorkoutData;
  const groupExercises = exercisesData[selectedGroup] || { equipment: [], bodyweight: [] };

  const handleAccept = (eq) => {
    setBookings((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        equipment: eq.name,
        hour: selectedHour,
        minute: selectedSlot,
        done: false,
      },
    ]);
    // Remove this suggestion from list
    setEquipmentSuggestions((prev) => prev.filter((e) => e.name !== eq.name));
  };

  const handleReject = (eq) => {
    setEquipmentSuggestions((prev) => prev.filter((e) => e.name !== eq.name));
  };

  return (
    <div className="equipment-page">
      <div className="equipment-main-card">
        <h2 className="page-title">Alternative Workout Plan</h2>
        <p>
          Muscle Group: <strong>{selectedGroup}</strong>
        </p>
        <p>
          Time Slot: <strong>{selectedHour}:{selectedSlot.toString().padStart(2, "0")}</strong>
        </p>

        {equipmentSuggestions.length > 0 && (
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

        {equipmentSuggestions.length === 0 && groupExercises.bodyweight.length === 0 && (
          <p>No alternatives available for this slot.</p>
        )}

        <p style={{ marginTop: "1rem", fontStyle: "italic" }}>
          Accept a suggestion to book it for your selected slot.
        </p>
      </div>
    </div>
  );
};

export default Alternative;

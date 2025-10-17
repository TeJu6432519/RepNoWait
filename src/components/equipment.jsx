import React, { useState } from "react";
import "./equipment.css";

const muscleGroups = ["Chest", "Back", "Legs", "Arms", "Shoulders", "Cardio"];

const allEquipments = {
  Chest: [
    { name: "Chest Press Machine", status: "available" },
    { name: "Incline Bench", status: "occupied" },
  ],
  Back: [
    { name: "Lat Pulldown", status: "available" },
    { name: "Seated Row", status: "maintenance" },
  ],
  Legs: [
    { name: "Leg Press", status: "available" },
    { name: "Squat Rack", status: "occupied" },
  ],
  Arms: [
    { name: "Bicep Curl Machine", status: "available" },
    { name: "Tricep Pushdown", status: "available" },
  ],
  Shoulders: [
    { name: "Shoulder Press", status: "occupied" },
    { name: "Lateral Raise Machine", status: "available" },
  ],
  Cardio: [
    { name: "Treadmill", status: "occupied" },
    { name: "Elliptical", status: "available" },
  ],
};

const hours = [6, 7, 8, 9, 10];
const slots = [0, 15, 30, 45];

const toMinutes = (hour, minute) => hour * 60 + minute;

const Equipment = ({ bookings, setBookings, setActiveView, setAltWorkoutData }) => {
  const [selectedGroup, setSelectedGroup] = useState("Chest");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notification, setNotification] = useState(null);

  // Check if slot is already booked
  const checkClash = (hour, slot, equipmentName) => {
    const newStart = toMinutes(hour, slot);
    const newEnd = newStart + 15;

    const equipmentBookings = bookings
      .filter((b) => b.equipment === equipmentName && !b.done)
      .map((b) => ({
        start: toMinutes(b.hour, b.minute),
        end: toMinutes(b.hour, b.minute) + 15,
      }));

    for (let b of equipmentBookings) {
      if (newStart < b.end && newEnd > b.start) {
        return "This equipment is already booked during this slot.";
      }
    }

    const clash = bookings.some(
      (b) => !b.done && toMinutes(b.hour, b.minute) === newStart
    );
    if (clash) return "You already have another equipment booked at this time!";

    return null;
  };

  // Book equipment
  const handleBook = () => {
    if (!selectedEquipment || selectedHour === null || selectedSlot === null) {
      setNotification({ type: "error", message: "Select equipment, hour & slot!" });
      return;
    }

    const clashMessage = checkClash(selectedHour, selectedSlot, selectedEquipment);
    if (clashMessage) {
      setNotification({ type: "error", message: clashMessage });
      return;
    }

    setBookings((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        equipment: selectedEquipment,
        hour: selectedHour,
        minute: selectedSlot,
        done: false,
      },
    ]);

    setNotification({
      type: "success",
      message: `Booked ${selectedEquipment} at ${selectedHour}:${selectedSlot
        .toString()
        .padStart(2, "0")}`,
    });

    setSelectedEquipment(null);
    setSelectedHour(null);
    setSelectedSlot(null);

    setTimeout(() => setNotification(null), 2000);
  };

  // Generate alternative exercises
  const handleGenerateAlternative = (group, hour, slot) => {
    if (!group || hour === null || slot === null) {
      setNotification({
        type: "error",
        message: "Cannot generate alternative: select valid group & slot!",
      });
      return;
    }

    setAltWorkoutData({
      selectedGroup: group,
      selectedHour: hour,
      selectedSlot: slot,
    });

    setActiveView("workout-generator");
  };

  return (
    <div className="equipment-page">
      <div className="equipment-main-card">
        <h1 className="page-title">Available Equipment</h1>

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {/* Muscle Group Tabs */}
        <div className="muscle-tabs">
          {muscleGroups.map((group) => (
            <button
              key={group}
              className={`muscle-tab ${selectedGroup === group ? "active" : ""}`}
              onClick={() => {
                setSelectedGroup(group);
                setSelectedEquipment(null);
                setSelectedHour(null);
                setSelectedSlot(null);
              }}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Equipment Grid */}
        <div className="equipment-grid">
          {allEquipments[selectedGroup].map((eq) => (
            <div
              key={eq.name}
              className={`equipment-card ${
                selectedEquipment === eq.name ? "selected" : ""
              } ${eq.status !== "available" ? "disabled" : ""}`}
              onClick={() => eq.status === "available" && setSelectedEquipment(eq.name)}
            >
              <div className={`equipment-status status-${eq.status}`}></div>
              <h3>{eq.name}</h3>
              <p>Status: {eq.status}</p>
            </div>
          ))}
        </div>

        {/* Time Selection */}
        {selectedEquipment && (
          <div className="time-selection">
            <h3>Select Hour & Slot</h3>

            <div className="hour-selection">
              {hours.map((h) => (
                <button
                  key={h}
                  className={`hour-btn ${selectedHour === h ? "selected" : ""}`}
                  onClick={() => setSelectedHour(h)}
                >
                  {h}:00
                </button>
              ))}
            </div>

            {selectedHour !== null && (
              <div className="slot-selection">
                {slots.map((s) => {
                  const clashMessage = checkClash(selectedHour, s, selectedEquipment);

                  return (
                    <div key={s} style={{ position: "relative", display: "inline-block" }}>
                      <button
                        className={`slot-btn ${selectedSlot === s ? "selected" : ""} ${
                          clashMessage ? "unavailable" : ""
                        }`}
                        disabled={!!clashMessage}
                        onClick={() => setSelectedSlot(s)}
                      >
                        {selectedHour}:{s.toString().padStart(2, "0")}
                      </button>

                      {clashMessage && (
                        <button
                          className="generate-alt-btn"
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            background: "#ff9800",
                            color: "#fff",
                            border: "none",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            marginTop: "2px",
                          }}
                          onClick={() =>
                            handleGenerateAlternative(selectedGroup, selectedHour, s)
                          }
                        >
                          Generate Alternative
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button className="book-btn" onClick={handleBook}>
              Book Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipment;

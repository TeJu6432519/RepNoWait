import React, { useState, useEffect } from "react";
import axios from "axios";
import "./equipment.css";

const hours = [6, 7, 8, 9];
const slots = [0, 15, 30, 45];

const toMinutes = (hour, minute) => hour * 60 + minute;

const Equipment = ({ bookings, setBookings, setActiveView, setAltWorkoutData }) => {
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [allEquipments, setAllEquipments] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notification, setNotification] = useState(null);

  // ---------------- Fetch muscle groups & time slots ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const mgRes = await axios.get("http://localhost:5001/api/muscle-groups");
        setMuscleGroups(mgRes.data);
        setSelectedGroup(mgRes.data[0]?.name || null);

        const tsRes = await axios.get("http://localhost:5001/api/time-slots");
        setTimeSlots(tsRes.data || []);

        // Fetch bookings from backend
        const bkRes = await axios.get("http://localhost:5001/api/bookings");
        setBookings(bkRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // ---------------- Fetch equipment whenever muscle group changes ----------------
  useEffect(() => {
    if (!selectedGroup || muscleGroups.length === 0) return;

    const group = muscleGroups.find((g) => g.name === selectedGroup);
    if (!group) return;

    const fetchEquipments = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/equipment/${group.id}`);
    
        const eqStatus = res.data.map((eq) => {
          const eqBookings = bookings.filter((b) => b.equipment_id === eq.id && !b.done);
        
          // Filter only slots relevant for this equipment (hours we show)
          const relevantSlots = timeSlots.filter(ts => {
            const [h, m] = ts.slot_start.split(":").map(Number);
            return hours.includes(h);
          });
        
          const allBooked = relevantSlots.every(ts =>
            eqBookings.some(b => b.time_slot_id === ts.id)
          );

          const status = eq.under_maintenance ? "maintenance" : allBooked ? "occupied" : "available";
          
          return {
            ...eq,
            status,
          };
        });
    
        setAllEquipments((prev) => ({ ...prev, [selectedGroup]: eqStatus }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchEquipments();
  }, [selectedGroup, bookings, muscleGroups, timeSlots]);

  // ---------------- Check if all user's slots are full ----------------
  const allUserSlotsFull = () => {
    if (!timeSlots || timeSlots.length === 0) return false;

    const relevantSlots = timeSlots.filter(ts => {
      const [h, m] = ts.slot_start.split(":").map(Number);
      return hours.includes(h) && slots.includes(m);
    });

    const isFull = relevantSlots.every(ts =>
      bookings.some(b => b.time_slot_id === ts.id && !b.done)
    );

    return isFull;
  };

  const allFull = allUserSlotsFull();

  // ---------------- Check slot clash ----------------
  const checkClash = (hour, slot, equipmentName) => {
    const newStart = toMinutes(hour, slot);
    const newEnd = newStart + 15;

    const equipmentBookings = bookings
      .filter((b) => {
        const eq = Object.values(allEquipments).flat().find((e) => e.name === equipmentName && e.id === b.equipment_id);
        return eq && !b.done;
      })
      .map((b) => {
        const ts = timeSlots.find((t) => t.id === b.time_slot_id);
        const [h, m] = ts.slot_start.split(":").map(Number);
        return { start: toMinutes(h, m), end: toMinutes(h, m) + 15 };
      });

    for (let b of equipmentBookings) {
      if (newStart < b.end && newEnd > b.start) {
        return "This equipment is already booked during this slot.";
      }
    }

    const clash = bookings.some((b) => {
      const ts = timeSlots.find((t) => t.id === b.time_slot_id);
      const [h, m] = ts.slot_start.split(":").map(Number);
      return !b.done && toMinutes(h, m) === newStart;
    });
    if (clash) return "You already have another equipment booked at this time!";

    return null;
  };

  // ---------------- Handle booking ----------------
  const handleBook = async () => {
    if (!selectedEquipment || selectedHour === null || selectedSlot === null) {
      setNotification({ type: "error", message: "Select equipment, hour & slot!" });
      return;
    }
  
    const eq = Object.values(allEquipments)
      .flat()
      .find((e) => e.name === selectedEquipment);
  
    if (!eq) {
      setNotification({ type: "error", message: "Selected equipment not found!" });
      return;
    }
  
    if (eq.under_maintenance) {
      setNotification({ type: "error", message: "Cannot book: equipment under maintenance!" });
      return;
    }
  
    const clashMessage = checkClash(selectedHour, selectedSlot, selectedEquipment);
    if (clashMessage) {
      setNotification({ type: "error", message: clashMessage });
      return;
    }
  
    try {
      const ts = timeSlots.find((t) =>
        t.slot_start.startsWith(
          `${selectedHour.toString().padStart(2, "0")}:${selectedSlot.toString().padStart(2, "0")}`
        )
      );
  
      if (!ts) {
        setNotification({ type: "error", message: "Time slot not found!" });
        return;
      }
  
      // Add user_id: 1 here
      const res = await axios.post("http://localhost:5001/api/bookings", {
        equipment_id: eq.id,
        time_slot_id: ts.id,
        user_id: 1,  // temporary hardcoded user
      });
  
      setBookings((prev) => [...prev, res.data]);
      setNotification({
        type: "success",
        message: `Booked ${selectedEquipment} at ${selectedHour}:${selectedSlot.toString().padStart(2, "0")}`,
      });
  
      setSelectedEquipment(null);
      setSelectedHour(null);
      setSelectedSlot(null);
  
      setTimeout(() => setNotification(null), 2000);
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Booking failed",
      });
    }
  };
  
  

  // ---------------- Generate Alternative ----------------
  const handleGenerateAlternative = (group, hour, slot) => {
    if (!group || hour === null || slot === null) {
      setNotification({ type: "error", message: "Cannot generate alternative: select valid group & slot!" });
      return;
    }

    setAltWorkoutData({ selectedGroup: group, selectedHour: hour, selectedSlot: slot });
    setActiveView("workout-generator");
  };

  // ---------------- Render ----------------
    return (
      <div className="equipment-page">
        <div className="equipment-main-card">
          <h1 className="page-title">Available Equipment</h1>

          {notification && <div className={`notification ${notification.type}`}>{notification.message}</div>}

          {/* Muscle Group Tabs */}
          <div className="muscle-tabs">
            {muscleGroups.map((group) => (
              <button
                key={group.id}
                className={`muscle-tab ${selectedGroup === group.name ? "active" : ""}`}
                onClick={() => {
                  setSelectedGroup(group.name);
                  setSelectedEquipment(null);
                  setSelectedHour(null);
                  setSelectedSlot(null);
                }}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* Equipment Grid */}
          <div className="equipment-grid">
            {allFull && (
              <div className="overlay-message">
                <div className="overlay-content-box">
                    All your slots are full!
                  </div>
              </div>
            )}

            {allEquipments[selectedGroup]?.map((eq) => (
              <div
              key={eq.id}
              className={`equipment-card ${
                selectedEquipment === eq.name ? "selected" : ""
              } ${eq.under_maintenance ? "under-maintenance" : ""} ${
                eq.status !== "available" ? "disabled" : ""
              }`}
              onClick={() => eq.status === "available" && !eq.under_maintenance && setSelectedEquipment(eq.name)}
            >
              <div className={`equipment-status status-${eq.status}`}></div>
              <h3>{eq.name}</h3>
              <p>Status: {eq.status}</p>
            </div>
            
            ))}
          </div>

          {/* Time Selection */}
          {!allFull && selectedEquipment && (
            <div className="time-selection">
              <h3>Select Hour & Slot</h3><br/>

              <div className="hour-selection">
                {hours.map((h) => (
                  <button key={h} className={`hour-btn ${selectedHour === h ? "selected" : ""}`} onClick={() => setSelectedHour(h)}>
                    {h}:00
                  </button>
                ))}
              </div><br/>

              {selectedHour !== null && (
                <div className="slot-selection">
                  {slots.map((s) => {
                    const clashMessage = checkClash(selectedHour, s, selectedEquipment);
                    return (
                      <div key={s} style={{ position: "relative", display: "inline-block" }}>
                        <button
                          className={`slot-btn ${selectedSlot === s ? "selected" : ""} ${clashMessage ? "unavailable" : ""}`}
                          disabled={!!clashMessage}
                          onClick={() => setSelectedSlot(s)}
                        >
                          {selectedHour}:{s.toString().padStart(2, "0")}
                        </button>

                        {clashMessage && (
                          <button
                            className="generate-alt-btn"
                            onClick={() => handleGenerateAlternative(selectedGroup, selectedHour, s)}
                          >
                            ⚡
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}<br/>

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

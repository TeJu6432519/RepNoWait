import React, { useEffect, useState } from "react";
import axios from "axios";
import "./equipment.css";

const Booking = ({ bookings, setBookings, userId }) => {
  const [equipments, setEquipments] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // ---------------- Fetch all equipments, time slots, and user's bookings ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const mgRes = await axios.get("http://localhost:5001/api/muscle-groups");
        const groups = mgRes.data || [];

        const eqPromises = groups.map((g) =>
          axios.get(`http://localhost:5001/api/equipment/${g.id}`)
        );
        const eqResults = await Promise.all(eqPromises);
        setEquipments(eqResults.flatMap(res => res.data));

        const tsRes = await axios.get("http://localhost:5001/api/time-slots");
        setTimeSlots(tsRes.data || []);

        // Fetch only bookings for current user
        const bkRes = await axios.get(`http://localhost:5001/api/bookings?user_id=${userId}`);
        setBookings(bkRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setBookings, userId]);

  if (loading) return <div className="equipment-page"><p>Loading bookings...</p></div>;
  if (!bookings || bookings.length === 0) return (
    <div className="equipment-page">
      <div className="equipment-main-card">
        <h1 className="page-title">My Bookings</h1>
        <p style={{ padding: "1rem" }}>No bookings yet.</p>
      </div>
    </div>
  );

  // ---------------- Helper maps ----------------
  const equipmentMap = equipments.reduce((acc, eq) => {
    acc[eq.id] = eq;
    return acc;
  }, {});

  const timeSlotMap = timeSlots.reduce((acc, ts) => {
    acc[ts.id] = ts;
    return acc;
  }, {});

  // ---------------- Add relative ID for display only ----------------
  const bookingsWithRelId = [...bookings]
    .sort((a, b) => {
      const aTime = timeSlotMap[a.time_slot_id]?.slot_start || "00:00";
      const bTime = timeSlotMap[b.time_slot_id]?.slot_start || "00:00";
      return aTime.localeCompare(bTime);
    })
    .map((b, index) => ({ ...b, relId: index + 1 }));

  // ---------------- Mark booking as done ----------------
  const handleDone = async (id) => {
    setProcessingId(id);
    try {
      await axios.put(`http://localhost:5001/api/bookings/${id}`, { done: true });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, done: true } : b));
      // Optional: remove after a delay
      setTimeout(() => setBookings(prev => prev.filter(b => b.id !== id)), 2000);
    } catch (err) {
      console.error("Done error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // ---------------- Cancel booking ----------------
  const handleCancel = async (id) => {
    setProcessingId(id);
    try {
      await axios.delete(`http://localhost:5001/api/bookings/${id}`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, cancelling: true } : b));
      setTimeout(() => setBookings(prev => prev.filter(b => b.id !== id)), 800);
    } catch (err) {
      console.error("Cancel error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const getSlotEnd = (slotStart) => {
    const [h, m] = slotStart.split(":").map(Number);
    const end = new Date(1970, 0, 1, h, m + 15);
    return `${end.getHours().toString().padStart(2,"0")}:${end.getMinutes().toString().padStart(2,"0")}`;
  };

  return (
    <div className="equipment-page">
      <div className="equipment-main-card">
        <h1 className="page-title">My Bookings</h1>

        <div className="equipment-grid">
          {bookingsWithRelId.map(b => {
            const eq = equipmentMap[b.equipment_id];
            const slot = timeSlotMap[b.time_slot_id];
            const start = slot?.slot_start || "00:00";
            const end = slot?.slot_end || getSlotEnd(start);

            return (
              <div
                key={b.id}
                className={`equipment-card ${b.done ? "done" : ""} ${b.cancelling ? "cancelling" : ""}`}
              >
                <h3>{b.relId}. {eq?.name || `Equipment #${b.equipment_id}`}</h3>
                <p>Time: {start} - {end}</p>
                <div style={{ marginTop: "0.5rem" }}>
                  {!b.done && (
                    <button
                      disabled={processingId === b.id}
                      className="book-btn done-btn"
                      onClick={() => handleDone(b.id)}
                    >
                      Done
                    </button>
                  )}
                  <button
                    disabled={processingId === b.id}
                    className="book-btn cancel-btn"
                    style={{ marginLeft: "0.5rem" }}
                    onClick={() => handleCancel(b.id)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Booking;

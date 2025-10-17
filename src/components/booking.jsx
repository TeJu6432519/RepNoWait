import React from "react";
import "./equipment.css";

const Booking = ({ bookings, setBookings }) => {
  // Format time
  const formatTime = (hour, minute) => {
    const totalMinutes = hour * 60 + minute;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  // Handle Done
  const handleDone = (idToUpdate) => {
    // Mark as done visually
    setBookings((prev) =>
      prev.map((b) => (b.id === idToUpdate ? { ...b, done: true } : b))
    );

    // Remove only this booking after 2s
    setTimeout(() => {
      setBookings((prev) => prev.filter((b) => b.id !== idToUpdate));
    }, 2000);
  };

  // Handle Cancel
  const handleCancel = (idToCancel) => {
    // Mark cancelling
    setBookings((prev) =>
      prev.map((b) => (b.id === idToCancel ? { ...b, cancelling: true } : b))
    );

    // Remove only this booking after animation
    setTimeout(() => {
      setBookings((prev) => prev.filter((b) => b.id !== idToCancel));
    }, 800);
  };

  if (!bookings || bookings.length === 0)
    return (
      <div className="equipment-page">
        <div className="equipment-main-card">
          <h1 className="page-title">My Bookings</h1>
          <p style={{ padding: "1rem" }}>No bookings yet.</p>
        </div>
      </div>
    );

  // Sort by time without mutating original array
  const sortedBookings = [...bookings].sort(
    (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)
  );

  return (
    <div className="equipment-page">
      <div className="equipment-main-card">
        <h1 className="page-title">My Bookings</h1>
        <div className="equipment-grid">
          {sortedBookings.map((b) => (
            <div
              key={b.id}
              className={`equipment-card ${b.done ? "done" : ""} ${
                b.cancelling ? "cancelling" : ""
              }`}
            >
              <h3>{b.equipment}</h3>
              <p>
                Time: {formatTime(b.hour, b.minute)} -{" "}
                {formatTime(b.hour, b.minute + 15)}
              </p>

              <div style={{ marginTop: "0.5rem" }}>
                {!b.done && (
                  <button
                    className="book-btn done-btn"
                    onClick={() => handleDone(b.id)}
                  >
                    Done
                  </button>
                )}
                <button
                  className="book-btn cancel-btn"
                  style={{ marginLeft: "0.5rem" }}
                  onClick={() => handleCancel(b.id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Booking;

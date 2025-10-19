import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Dumbbell,
  Zap,
  Clock,
  Map as MapIcon,
  User,
} from "lucide-react";

import Calendar from "./Calendar";
import Equipment from "./equipment";
import Booking from "./booking";
import Map from "./map"; // your SVG map
import Profile from "./profile";
import Alternative from "./alternative";
import axios from "axios";
import "./dashboard.css";

// Map equipment IDs to names (use the same as in your backend)
const EQUIPMENT_MAP = {
  1: "Chest Press Machine",
  2: "Incline Bench",
  3: "Lat Pulldown",
  4: "Seated Row",
  5: "Leg Press",
  6: "Squat Rack",
  7: "Bicep Curl Machine",
  8: "Tricep Pushdown",
  9: "Shoulder Press",
  10: "Lateral Raise Machine",
  11: "Treadmill",
  12: "Elliptical",
};

// Map time_slot_id to hour and minute
const TIME_SLOT_MAP = {
  1: { hour: 6, minute: 0 },
  2: { hour: 6, minute: 15 },
  3: { hour: 6, minute: 30 },
  4: { hour: 6, minute: 45 },
  5: { hour: 7, minute: 0 },
  6: { hour: 7, minute: 15 },
  7: { hour: 7, minute: 30 },
  8: { hour: 7, minute: 45 },
  9: { hour: 8, minute: 0 },
  10: { hour: 8, minute: 15 },
  11: { hour: 8, minute: 30 },
  12: { hour: 8, minute: 45 },
  // Add remaining slots as needed
};

const Dashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [bookings, setBookings] = useState([]);
  const [altWorkoutData, setAltWorkoutData] = useState(null);

  // Fetch bookings from backend
  const fetchBookings = async () => {
    try {
      const res = await axios.get("/api/bookings");
      const dataArray = Array.isArray(res.data) ? res.data : res.data.bookings || [];

      const mappedBookings = dataArray.map((b) => ({
        ...b,
        equipment: EQUIPMENT_MAP[b.equipment_id] || "Unknown",
        hour: TIME_SLOT_MAP[b.time_slot_id]?.hour ?? 0,
        minute: TIME_SLOT_MAP[b.time_slot_id]?.minute ?? 0,
        done: b.done ?? false,
      }));

      setBookings(mappedBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err.message);
      setBookings([]);
    }
  };

  // Fetch bookings once on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Refresh bookings when dashboard tab becomes active
  useEffect(() => {
    if (activeView === "dashboard") {
      fetchBookings();
    }
  }, [activeView]);

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h1 className="brand-title">
            Rep<span className="highlight-now">NoW</span>ait
          </h1>
        </div>

        <nav>
          {[
            { key: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
            { key: "calendar", icon: <CalendarIcon size={20} />, label: "Calendar" },
            { key: "equipment", icon: <Dumbbell size={20} />, label: "Equipment" },
            { key: "workout-generator", icon: <Zap size={20} />, label: "Workout Plans" },
            { key: "bookings", icon: <Clock size={20} />, label: "My Bookings" },
            { key: "regions", icon: <MapIcon size={20} />, label: "Gym Regions" },
            { key: "profile", icon: <User size={20} />, label: "Profile" },
          ].map((item) => (
            <div
              key={item.key}
              className={`nav-item ${activeView === item.key ? "active" : ""}`}
              onClick={() => setActiveView(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h2 id="page-title">
            {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
          </h2>
          <div className="user-profile">
            <div className="profile-avatar">JD</div>
            <div>
              <div style={{ fontWeight: 600 }}>John Doe</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>Premium Member</div>
            </div>
          </div>
        </div>

        <div className="view active">
          {/* Dashboard */}
          {activeView === "dashboard" && (
            <div className="dashboard-grid">
              <h3>Today's Workout Plan</h3>
              {bookings.length === 0 && <p>No bookings yet.</p>}
              {bookings.map((b) => (
                <div key={b.id} className={`exercise ${b.done ? "done" : ""}`}>
                  <div className="exercise-info">
                    <strong>{b.equipment}</strong>
                    <div style={{ opacity: 0.7 }}>
                      {b.hour ?? 0}:
                      {(b.minute ?? 0).toString().padStart(2, "0")} -{" "}
                      {b.hour ?? 0}:
                      {((b.minute ?? 0) + 15).toString().padStart(2, "0")}
                    </div>
                  </div>
                  <div className="status-container">
                    <div
                      className={`equipment-status ${
                        b.done ? "status-done" : "status-available pulse"
                      }`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Calendar */}
          {activeView === "calendar" && <Calendar />}

          {/* Equipment */}
          {activeView === "equipment" && (
            <Equipment
              bookings={bookings}
              setBookings={setBookings}
              setAltWorkoutData={setAltWorkoutData}
              setActiveView={setActiveView}
            />
          )}

          {/* Bookings */}
          {activeView === "bookings" && (
            <Booking bookings={bookings} setBookings={setBookings} />
          )}

          {/* Workout Plans / Alternative Workouts */}
          {activeView === "workout-generator" && (
            <Alternative
              bookings={bookings}
              setBookings={setBookings}
              altWorkoutData={altWorkoutData}
              setAltWorkoutData={setAltWorkoutData}
            />
          )}

          {/* Gym Map */}
          {activeView === "regions" && <Map bookings={bookings} />}

          {/* Profile */}
          {activeView === "profile" && <Profile />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

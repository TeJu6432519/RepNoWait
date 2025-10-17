import React, { useState } from "react";
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
import "./dashboard.css";

const Dashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [bookings, setBookings] = useState([]); // global booking state
  const [altWorkoutData, setAltWorkoutData] = useState(null); // selected slot info for alternatives

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
                      {b.hour}:{b.minute.toString().padStart(2, "0")} -{" "}
                      {b.hour}:{(b.minute + 15).toString().padStart(2, "0")}
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
              setAltWorkoutData={setAltWorkoutData} // pass setter
              setActiveView={setActiveView} // pass setter to switch tab
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

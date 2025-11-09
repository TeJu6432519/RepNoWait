import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Dumbbell,
  Zap,
  Clock,
  Map as MapIcon,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import Calendar from "./Calendar";
import Equipment from "./equipment";
import Booking from "./booking";
import Map from "./map";
import Profile from "./profile";
import Alternative from "./alternative";
import "./dashboard.css";

const Dashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [bookings, setBookings] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [altWorkoutData, setAltWorkoutData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ completed: 0, remaining: 0 });

  const [quote, setQuote] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const auth = getAuth();

  const fetchQuote = () => {
    const motivationalQuotes = [
      "Discipline is the bridge between goals and accomplishment.",
      "Your body can stand almost anything. It's your mind that you have to convince.",
      "The pain you feel today will be the strength you feel tomorrow.",
      "Strive for progress, not perfection.",
      "Fall down seven times, stand up eight.",
    ];
    const selectedQuote =
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(selectedQuote);
    setShowQuote(true);
    setTimeout(() => setShowQuote(false), 6000);
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchData = async (userId) => {
    try {
      setLoading(true);
      const mgRes = await axios.get("http://localhost:5001/api/muscle-groups");
      const groups = mgRes.data || [];

      const eqResults = await Promise.all(
        groups.map((g) => axios.get(`http://localhost:5001/api/equipment/${g.id}`))
      );
      const fetchedEquipments = eqResults.flatMap((res) => res.data);
      setEquipments(fetchedEquipments);

      const tsRes = await axios.get("http://localhost:5001/api/time-slots");
      const fetchedTimeSlots = tsRes.data || [];
      setTimeSlots(fetchedTimeSlots);

      const bkRes = await axios.get(
        `http://localhost:5001/api/bookings?user_id=${userId}`
      );
      const fetchedBookings = bkRes.data || [];

      const bwRes = await axios.get(
        `http://localhost:5001/api/bodyweight-bookings?user_id=${userId}`
      );
      const fetchedBodyweight = bwRes.data || [];

      const allBookings = [
        ...fetchedBookings.map((b) => ({ ...b, type: "equipment" })),
        ...fetchedBodyweight.map((b) => ({ ...b, type: "bodyweight" })),
      ];

      setBookings(allBookings);
      updateChart(allBookings);
    } catch (err) {
      console.error("❌ Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateChart = (data) => {
    const completedCount = data.filter((b) => b.done).length;
    const totalCount = data.length;
    setChartData({
      completed: completedCount,
      remaining: Math.max(totalCount - completedCount, 0),
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          name: user.displayName || "Elite User",
          email: user.email,
          uid: user.uid,
        };
        setCurrentUser(userData);
        fetchData(user.uid);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const equipmentMap = useMemo(
    () =>
      equipments.reduce((acc, eq) => {
        acc[eq.id] = eq;
        return acc;
      }, {}),
    [equipments]
  );

  const timeSlotMap = useMemo(
    () =>
      timeSlots.reduce((acc, ts) => {
        acc[ts.id] = ts;
        return acc;
      }, {}),
    [timeSlots]
  );

  const getSlotEnd = (slotStart) => {
    const [h, m] = slotStart.split(":").map(Number);
    const end = new Date(1970, 0, 1, h, m + 15);
    return `${end.getHours().toString().padStart(2, "0")}:${end
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const handleToggleDone = async (booking) => {
    try {
      const updatedStatus = !booking.done;
      const updatedBookings = bookings.map((b) =>
        b.id === booking.id ? { ...b, done: updatedStatus } : b
      );
      setBookings(updatedBookings);
      updateChart(updatedBookings);
      await axios.put(`http://localhost:5001/api/bookings/${booking.id}`, {
        done: updatedStatus,
      });
    } catch (err) {
      console.error("❌ Error updating booking status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Dumbbell size={48} className="pulse" style={{ marginBottom: "20px" }} />
        <h2>Initializing Matrix... Standby.</h2>
      </div>
    );
  }

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
            { key: "calendar", icon: <CalendarIcon size={20} />, label: "Schedule Matrix" },
            { key: "equipment", icon: <Dumbbell size={20} />, label: "Equipment Access" },
            { key: "workout-generator", icon: <Zap size={20} />, label: "AI Workout Plan" },
            { key: "bookings", icon: <Clock size={20} />, label: "Time Slots" },
            { key: "regions", icon: <MapIcon size={20} />, label: "Gym Regions" },
            { key: "profile", icon: <User size={20} />, label: "User Profile" },
          ].map((item) => (
            <div
              key={item.key}
              className={`nav-item ${activeView === item.key ? "active" : ""}`}
              onClick={() => setActiveView(item.key)}
              style={
                activeView === item.key
                  ? { boxShadow: "0 0 10px rgba(0, 212, 255, 0.5)" }
                  : {}
              }
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
          <h2 id="page-title" style={{ color: "#beff7d" }}>
            {activeView.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")} System
          </h2>
        </div>

        <div className="view active">
          {activeView === "dashboard" && (
            <div className="dashboard-grid">
              {showQuote && (
                <div className="quote-popup">
                  <Zap size={16} style={{ marginRight: "5px" }} />{" "}
                  <strong>Daily Uplink:</strong> {quote}
                </div>
              )}

              {/* Bookings Section */}
              <div className="card">
                <h3>
                  <Dumbbell size={20} style={{ marginRight: "10px" }} />
                  Active Access Slots
                </h3>

                {bookings.length === 0 ? (
                  <p className="no-activities">
                    <AlertTriangle size={24} style={{ marginBottom: "10px" }} />
                    <br />
                    No workouts yet.
                  </p>
                ) : (
                  Object.entries(
                    bookings.reduce((acc, b) => {
                      const dateKey = b.date ? b.date.split("T")[0] : "TODAY";
                      acc[dateKey] = acc[dateKey] || [];
                      acc[dateKey].push(b);
                      return acc;
                    }, {})
                  )
                    // ✅ Sort by date
                    .sort(([a], [b]) => new Date(a) - new Date(b))
                    .map(([date, list]) => (
                      <div key={date}>
                        <h4>📅 {date === "TODAY" ? "TODAY" : date}</h4>
                  
                        <div className="booking-list">
                          {list
                            // ✅ Sort by time slot
                            .sort((a, b) => {
                              const slotA = timeSlotMap[a.time_slot_id]?.slot_start || "00:00";
                              const slotB = timeSlotMap[b.time_slot_id]?.slot_start || "00:00";
                              return slotA.localeCompare(slotB);
                            })
                            .map((b) => {
                              const eq = equipmentMap[b.equipment_id];
                              const slot = timeSlotMap[b.time_slot_id];
                              const start = slot?.slot_start || "00:00";
                              const end = slot?.slot_end || getSlotEnd(start);
                              const isDone = b.done;
                              const isBodyweight = !b.equipment_id;
                  
                              return (
                                <div
                                  key={b.id}
                                  className={`booking-card ${isDone ? "done" : ""}`}
                                  style={{
                                    transition: "all 0.3s ease",
                                    opacity: isDone ? 0.8 : 1,
                                    background: isDone
                                      ? "linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(78, 205, 196, 0.05))"
                                      : "linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(78, 205, 196, 0.15))",
                                    border: isDone
                                      ? "2px solid rgba(0, 212, 255, 0.3)"
                                      : "2px solid rgba(0, 212, 255, 0.15)",
                                    boxShadow: isDone
                                      ? "0 0 12px rgba(0, 212, 255, 0.2)"
                                      : "0 0 8px rgba(0, 212, 255, 0.1)",
                                    borderLeft: isBodyweight
                                      ? "4px solid #00e0ff"
                                      : "4px solid #4ecdc4",
                                    borderLeftColor: isDone
                                      ? "#00ffaa"
                                      : isBodyweight
                                      ? "#00e0ff"
                                      : "#4ecdc4",
                                    color: "#fff",
                                  }}
                                >
                                  <div className="booking-info">
                                    <strong
                                      style={{
                                        color: isBodyweight ? "#00e0ff" : "#beff7d",
                                        textDecoration: isDone ? "line-through" : "none",
                                        opacity: isDone ? 0.8 : 1,
                                      }}
                                    >
                                      {isBodyweight
                                        ? `🧍‍♂️ ${b.exercise_name || "Bodyweight Exercise"}`
                                        : eq?.name || `Equipment #${b.equipment_id}`}
                                    </strong>
                                    <span className="time">
                                      <Clock size={14} style={{ marginRight: "5px" }} />
                                      {start} - {end}
                                    </span>
                                  </div>
                  
                                  <button
                                    className={`status-btn ${isDone ? "done" : "not-done"}`}
                                    onClick={() => handleToggleDone(b)}
                                    style={{
                                      background: isDone
                                        ? "rgba(0, 255, 170, 0.15)"
                                        : "rgba(255, 107, 107, 0.1)",
                                      border: isDone
                                        ? "1px solid rgba(0, 255, 170, 0.5)"
                                        : "1px solid rgba(255, 107, 107, 0.5)",
                                      color: isDone ? "#00ffaa" : "#ff6b6b",
                                      boxShadow: isDone
                                        ? "0 0 8px rgba(0, 255, 170, 0.3)"
                                        : "0 0 8px rgba(255, 107, 107, 0.3)",
                                      transition: "all 0.3s ease",
                                    }}
                                  >
                              {isDone ? (
                                <>
                                  <CheckCircle size={16} style={{ marginRight: "5px" }} /> Completed
                                </>
                              ) : (
                                <>
                                  <XCircle size={16} style={{ marginRight: "5px" }} /> Mark Done
                                </>
                              )}
                            </button>
                          </div>

                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Progress Chart */}
              <div className="card progress-card" style={{ position: "relative" }}>
                <h3>
                  <Zap size={20} style={{ marginRight: "10px" }} />
                  Session Completion Rate
                </h3>

                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed", value: chartData.completed },
                        { name: "Remaining", value: chartData.remaining },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={70}
                      paddingAngle={3}
                      cornerRadius={8}
                      animationBegin={0}
                      animationDuration={800}
                      labelLine={false}
                    >
                      <Cell fill="#4ecdc4" />
                      <Cell fill="#2a2a3d" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#FFF",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  {chartData.completed + chartData.remaining > 0
                    ? (
                        (chartData.completed /
                          (chartData.completed + chartData.remaining)) *
                        100
                      ).toFixed(0) + "%"
                    : "0%"}
                </div>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <div>Total Progress</div>
                  <div style={{ fontWeight: "bold", color: "#00d4ff" }}>
                    {chartData.completed} /{" "}
                    {Math.max(chartData.completed + chartData.remaining, 1)} Workouts
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "calendar" && <Calendar />}
          {activeView === "equipment" && (
            <Equipment
              bookings={bookings}
              setBookings={setBookings}
              setAltWorkoutData={setAltWorkoutData}
              setActiveView={setActiveView}
            />
          )}
          {activeView === "bookings" && (
            <Booking
              bookings={bookings}
              setBookings={setBookings}
              userId={currentUser?.uid}
            />
          )}
          {activeView === "workout-generator" && (
            <Alternative
              bookings={bookings}
              setBookings={setBookings}
              altWorkoutData={altWorkoutData}
              setAltWorkoutData={setAltWorkoutData}
            />
          )}
          {activeView === "regions" && <Map bookings={bookings} />}
          {activeView === "profile" && <Profile />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

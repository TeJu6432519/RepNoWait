import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ for navigation
import "./calendar.css";

const Calendar = () => {
  const navigate = useNavigate(); // ✅ initialize navigation

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [workoutDays, setWorkoutDays] = useState([
    5, 8, 12, 15, 19, 22, 26, 29,
  ]);
  const [selectedDay, setSelectedDay] = useState(null);

  // Workout plans
  const workoutPlans = {
    5: [
      { exercise: "Chest Press Machine", sets: 3, reps: "12" },
      { exercise: "Incline Dumbbell Press", sets: 3, reps: "10" },
      { exercise: "Cable Flyes", sets: 3, reps: "12" },
    ],
    8: [
      { exercise: "Treadmill", duration: "20 min" },
      { exercise: "Elliptical", duration: "15 min" },
      { exercise: "Rowing Machine", duration: "10 min" },
    ],
    12: [
      { exercise: "Lat Pulldown", sets: 3, reps: "10" },
      { exercise: "Barbell Rows", sets: 4, reps: "8" },
      { exercise: "Assisted Dips", sets: 3, reps: "12" },
    ],
    15: [
      { exercise: "Barbell Squats", sets: 4, reps: "8" },
      { exercise: "Leg Press", sets: 3, reps: "12" },
      { exercise: "Leg Curls", sets: 3, reps: "12" },
      { exercise: "Calf Raises", sets: 3, reps: "15" },
    ],
    19: [
      { exercise: "Dumbbell Curls", sets: 3, reps: "10" },
      { exercise: "Barbell Curls", sets: 3, reps: "8" },
      { exercise: "Tricep Rope Pushdown", sets: 3, reps: "12" },
      { exercise: "Overhead Press", sets: 3, reps: "10" },
    ],
    22: [
      { exercise: "Bench Press", sets: 4, reps: "8" },
      { exercise: "Dumbbell Bench Press", sets: 3, reps: "10" },
      { exercise: "Push-ups", sets: 3, reps: "15" },
    ],
    26: [
      { exercise: "Stationary Bike", duration: "30 min" },
      { exercise: "Jump Rope", duration: "2 min", sets: 5 },
      { exercise: "Burpees", sets: 3, reps: "20" },
    ],
    29: [
      { exercise: "Deadlifts", sets: 4, reps: "6" },
      { exercise: "Power Cleans", sets: 4, reps: "5" },
      { exercise: "Farmer's Carries", sets: 3, reps: "40 steps" },
    ],
  };

  // Calendar helpers
  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
    setSelectedDay(null);
  };

  const isToday = (day) => {
    const now = new Date();
    return (
      day === now.getDate() &&
      currentDate.getMonth() === now.getMonth() &&
      currentDate.getFullYear() === now.getFullYear()
    );
  };

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleDayClick = (day) => {
    if (!day || !workoutDays.includes(day)) return;
    setSelectedDay((prev) => (prev === day ? null : day));
  };

  return (
    <div className="calendar-container">
      <div className="calendar-content">
        <div className="calendar-card">
          {/* Header */}
          <div className="calendar-header">
            {/* Left side: Month navigation */}
            <div className="header-left">
              <button className="calendar-nav-btn" onClick={prevMonth}>
                <ChevronLeft size={20} />
              </button>
            </div>
              
                {/* Center: Month-Year and Today button */}
            <div
                className="header-center"
                style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <h2 className="month-year">{monthName}</h2>
                <button
                  className="home-btn"
                  style={{ marginTop: "0.5rem" }}
                  onClick={() => {
                    setCurrentDate(new Date());
                    setSelectedDay(null);
                  }}
                >
                  Today
                </button>
              </div>

            {/* Right side */}
            <div className="header-right">
              <button className="calendar-nav-btn" onClick={nextMonth}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="weekday-label">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {days.map((day, index) => (
              <React.Fragment key={index}>
                <div
                  className={`calendar-day ${day === null ? "empty" : ""} ${
                    isToday(day) ? "today" : ""
                  } ${workoutDays.includes(day) ? "has-workout" : ""} ${
                    selectedDay === day ? "selected" : ""
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  {day &&
                    workoutDays.includes(day) &&
                    workoutPlans[day] &&
                    selectedDay !== day && (
                      <div className="day-tooltip">
                        <h4>Workout Plan</h4>
                        <ul>
                          {workoutPlans[day].slice(0, 3).map((exercise, idx) => (
                            <li key={idx}>{exercise.exercise}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {day}
                </div>

                {/* Inline Workout Details */}
                {selectedDay === day && workoutPlans[day] && (
                  <div
                    className="inline-workout-details"
                    ref={(el) => {
                      if (el)
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }}
                  >
                    <h4>Day {day} Workout Plan</h4>
                    <ul>
                      {workoutPlans[day].map((exercise, idx) => (
                        <li key={idx}>
                          <strong>{exercise.exercise}</strong> —{" "}
                          {exercise.sets && `Sets: ${exercise.sets}`}{" "}
                          {exercise.reps && `Reps: ${exercise.reps}`}{" "}
                          {exercise.duration && `Duration: ${exercise.duration}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </React.Fragment>
            ))}

            {/* Dark Overlay */}
            <div className="calendar-overlay"></div>
          </div>

          {/* Legend */}
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-dot today-dot"></div>
              <span>Today</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot workout-dot"></div>
              <span>Workout Day</span>
            </div>
          </div>

          {/* Workout Days Summary */}
          <div className="workout-summary">
            <h3>Workout Days This Month</h3>
            <div className="workout-days-list">
              {workoutDays.length > 0 ? (
                workoutDays.map((day) => (
                  <span
                    key={day}
                    className={`workout-badge ${
                      selectedDay === day ? "active" : ""
                    }`}
                    onClick={() => setSelectedDay(day)}
                  >
                    Day {day}
                  </span>
                ))
              ) : (
                <p className="no-workouts">No workouts scheduled</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="calendar-stats">
            <div className="stat-box">
              <div className="stat-value">{workoutDays.length}</div>
              <div className="stat-label">Workouts Scheduled</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">
                {daysInMonth - workoutDays.length}
              </div>
              <div className="stat-label">Rest Days</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">
                {workoutDays.length > 0
                  ? ((workoutDays.length / daysInMonth) * 100).toFixed(0)
                  : 0}
                %
              </div>
              <div className="stat-label">Activity Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;

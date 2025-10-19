import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./calendar.css";

const Calendar = () => {
  const today = new Date();

  // Base states
  const [currentDate, setCurrentDate] = useState(today);
  const [workoutPlans, setWorkoutPlans] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [overlayActive, setOverlayActive] = useState(false);

  // Weekly planner states
  const [weekSelection, setWeekSelection] = useState([]);
  const [weekMuscle, setWeekMuscle] = useState("");
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const muscleGroups = [
    "Chest",
    "Back",
    "Legs",
    "Arms",
    "Shoulders",
    "Cardio",
    "Core",
  ];

  // Calendar utilities
  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

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

  // Apply weekly plan
  const applyWeeklyPlan = () => {
    if (!weekMuscle || weekSelection.length === 0) {
      alert("Select days and muscle group!");
      return;
    }
    const updated = { ...workoutPlans };
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const weekdayName = weekDays[date.getDay()];
      if (weekSelection.includes(weekdayName)) {
        updated[d] = updated[d] || [];
        updated[d].push({
          exercise: `${weekMuscle} Routine`,
          sets: 3,
          reps: "12",
        });
      }
    }
    setWorkoutPlans(updated);
    setWeekSelection([]);
    setWeekMuscle("");
    alert("Weekly plan applied successfully!");
  };

  // Build calendar days
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const workoutDays = Object.keys(workoutPlans).map(Number);

  const handleDayClick = (day) => {
    if (!day) return;
    setSelectedDay(selectedDay === day ? null : day);
  };

  const handleExerciseEdit = (day, index, field, value) => {
    const updated = { ...workoutPlans };
    updated[day][index][field] = value;
    setWorkoutPlans(updated);
  };

  const addExercise = (day) => {
    const updated = { ...workoutPlans };
    if (!updated[day]) updated[day] = [];
    updated[day].push({ exercise: "New Exercise", sets: 3, reps: "10" });
    setWorkoutPlans(updated);
  };

  const deleteExercise = (day, index) => {
    const updated = { ...workoutPlans };
    updated[day].splice(index, 1);
    setWorkoutPlans(updated);
  };

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="calendar-container">
      {/* Full Calendar Overlay */}
      <div className={`calendar-overlay ${overlayActive ? "active" : ""}`} />

      <div className="calendar-content">
        <div className="calendar-card">

          {/* Weekly Planner */}
          <div className="weekly-planner">
            <h3>Weekly Planner</h3>
            <div className="weekday-select">
              {weekDays.map((day) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={weekSelection.includes(day)}
                    onChange={() =>
                      setWeekSelection((prev) =>
                        prev.includes(day)
                          ? prev.filter((d) => d !== day)
                          : [...prev, day]
                      )
                    }
                  />
                  {day}
                </label>
              ))}
            </div>

            <div className="weekly-muscle">
              <select
                value={weekMuscle}
                onChange={(e) => setWeekMuscle(e.target.value)}
              >
                <option value="">Select Muscle Group</option>
                {muscleGroups.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button className="apply-week-btn" onClick={applyWeeklyPlan}>
                Apply to Month
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="calendar-header">
            <button className="calendar-nav-btn" onClick={prevMonth}>
              <ChevronLeft size={20} />
            </button>
            <div className="header-center">
              <h2 className="month-year">{monthName}</h2>
              <button
                className="home-btn"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </button>
            </div>
            <button className="calendar-nav-btn" onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="weekdays">
            {weekDays.map((d) => (
              <div key={d} className="weekday-label">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {days.map((day, i) => (
              <div
                key={i}
                className={`calendar-day ${day === null ? "empty" : ""} ${
                  isToday(day) ? "today" : ""
                } ${workoutDays.includes(day) ? "has-workout" : ""}`}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => {
                  if (workoutDays.includes(day)) setOverlayActive(true);
                  setHoveredDay(day);
                }}
                onMouseLeave={() => {
                  setOverlayActive(false);
                  setHoveredDay(null);
                }}
              >
                {day}

                {/* Hover tooltip */}
                {hoveredDay === day && workoutPlans[day] && (
                  <div className="day-tooltip">
                    <ul>
                      {workoutPlans[day].slice(0, 3).map((ex, idx) => (
                        <li key={idx}>{ex.exercise}</li>
                      ))}
                      {workoutPlans[day].length > 3 && <li>+ more...</li>}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Inline Editor */}
          {selectedDay && workoutPlans[selectedDay] && (
            <div className="overlay" onClick={() => setSelectedDay(null)}>
              <div className="inline-workout-details" onClick={(e) => e.stopPropagation()}>
                <h4>Day {selectedDay} Workout Plan</h4>
                <ul>
                  {workoutPlans[selectedDay].map((ex, idx) => (
                    <li key={idx}>
                      <input
                        value={ex.exercise}
                        onChange={(e) =>
                          handleExerciseEdit(selectedDay, idx, "exercise", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) =>
                          handleExerciseEdit(selectedDay, idx, "sets", e.target.value)
                        }
                        style={{ width: "50px" }}
                      />
                      <input
                        type="text"
                        value={ex.reps}
                        onChange={(e) =>
                          handleExerciseEdit(selectedDay, idx, "reps", e.target.value)
                        }
                        style={{ width: "60px" }}
                      />
                      <button onClick={() => deleteExercise(selectedDay, idx)}>❌</button>
                    </li>
                  ))}
                </ul>
                <button onClick={() => addExercise(selectedDay)}>➕ Add Exercise</button>
                <button className="close-overlay-btn" onClick={() => setSelectedDay(null)}>Close</button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="calendar-stats">
            <div className="stat-box">
              <div className="stat-value">{workoutDays.length}</div>
              <div className="stat-label">Workouts Scheduled</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{daysInMonth - workoutDays.length}</div>
              <div className="stat-label">Rest Days</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">
                {workoutDays.length > 0
                  ? ((workoutDays.length / daysInMonth) * 100).toFixed(0)
                  : 0}%
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

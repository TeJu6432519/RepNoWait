import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./calendar.css";

const Calendar = () => {
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

  // --- States ---
  const [currentDate, setCurrentDate] = useState(() => {
    const saved = localStorage.getItem("currentDate");
    return saved ? new Date(saved) : new Date();
  });

  // Structure: { '2025-10': { 1: [{exercise, sets, reps}], 2: [...] } }
  const [workoutPlans, setWorkoutPlans] = useState(() => {
    const saved = localStorage.getItem("workoutPlans");
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [weekSelection, setWeekSelection] = useState(() => {
    const saved = localStorage.getItem("weekSelection");
    return saved ? JSON.parse(saved) : [];
  });
  const [weekMuscle, setWeekMuscle] = useState(() => {
    const saved = localStorage.getItem("weekMuscle");
    return saved ? saved : "";
  });

  // --- Save to localStorage ---
  useEffect(() => {
    localStorage.setItem("currentDate", currentDate.toISOString());
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem("workoutPlans", JSON.stringify(workoutPlans));
  }, [workoutPlans]);

  useEffect(() => {
    localStorage.setItem("weekSelection", JSON.stringify(weekSelection));
  }, [weekSelection]);

  useEffect(() => {
    localStorage.setItem("weekMuscle", weekMuscle);
  }, [weekMuscle]);

  // --- Utilities ---
  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
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

  // --- Weekly Plan ---
  const applyWeeklyPlan = () => {
    if (!weekMuscle || weekSelection.length === 0) {
      alert("Select days and muscle group!");
      return;
    }

    const updated = { ...workoutPlans };
    if (!updated[monthKey]) updated[monthKey] = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const weekdayName = weekDays[date.getDay()];
      if (weekSelection.includes(weekdayName)) {
        updated[monthKey][d] = updated[monthKey][d] || [];
        updated[monthKey][d].push({
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

  // --- Clear Selected Days ---
  const clearSelectedDays = () => {
    if (weekSelection.length === 0) {
      alert("Select days to clear!");
      return;
    }

    if (!window.confirm("Are you sure you want to clear workouts for the selected days?")) return;

    const updated = { ...workoutPlans };
    if (!updated[monthKey]) return;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const weekdayName = weekDays[date.getDay()];
      if (weekSelection.includes(weekdayName)) {
        delete updated[monthKey][d];
      }
    }

    setWorkoutPlans(updated);
    setWeekSelection([]);
    alert("Selected days cleared!");
  };

  // --- Calendar Grid ---
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const workoutDays = Object.keys(workoutPlans[monthKey] || {}).map(Number);

  const handleDayClick = (day) => {
    if (!day) return;
    setSelectedDay(selectedDay === day ? null : day);
  };

  const handleExerciseEdit = (day, index, field, value) => {
    const updated = { ...workoutPlans };
    updated[monthKey][day][index][field] = value;
    setWorkoutPlans(updated);
  };

  const addExercise = (day) => {
    const updated = { ...workoutPlans };
    if (!updated[monthKey]) updated[monthKey] = {};
    if (!updated[monthKey][day]) updated[monthKey][day] = [];
    updated[monthKey][day].push({ exercise: "New Exercise", sets: 3, reps: "10" });
    setWorkoutPlans(updated);
  };

  const deleteExercise = (day, index) => {
    const updated = { ...workoutPlans };
    updated[monthKey][day].splice(index, 1);
    if (updated[monthKey][day].length === 0) delete updated[monthKey][day];
    setWorkoutPlans(updated);
  };

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="calendar-container">

      {/* Weekly Planner */}
      <div className="weekly-planner">
        <h3>Weekly Planner</h3>

        <div className="weekday-select">
          {weekDays.map((day) => (
            <div
              key={day}
              className={`weekday-card ${weekSelection.includes(day) ? "selected" : ""}`}
              onClick={() =>
                setWeekSelection((prev) =>
                  prev.includes(day)
                    ? prev.filter((d) => d !== day)
                    : [...prev, day]
                )
              }
            >
              {day}
            </div>
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
          <button className="clear-week-btn" onClick={clearSelectedDays}>
            Clear Selected Days
          </button>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="calendar-card">

        {/* Header */}
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={prevMonth}>
            <ChevronLeft size={20} />
          </button>

          <div className="header-center" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 className="month-year">{monthName}</h2>
            <button
              className="home-btn"
              onClick={() => setCurrentDate(new Date())}
              style={{ marginTop: "5px" }}
            >
              Today
            </button>
          </div>

          <button className="calendar-nav-btn" onClick={nextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekdays */}
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
              } ${
                day && workoutPlans[monthKey] && workoutPlans[monthKey][day] && workoutPlans[monthKey][day].length > 0
                  ? "has-workout"
                  : ""
              }`}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => {
                if (!selectedDay && workoutDays.includes(day)) setHoveredDay(day);
              }}
              onMouseLeave={() => {
                if (!selectedDay) setHoveredDay(null);
              }}
            >
              {day}
              {day && hoveredDay === day && workoutPlans[monthKey] && workoutPlans[monthKey][day] && (
                <div className="day-tooltip">
                  <ul>
                    {workoutPlans[monthKey][day].slice(0, 3).map((ex, idx) => (
                      <li key={idx}>{ex.exercise}</li>
                    ))}
                    {workoutPlans[monthKey][day].length > 3 && <li>+ more...</li>}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Inline Editor Overlay */}
        {selectedDay && workoutPlans[monthKey] && workoutPlans[monthKey][selectedDay] && (
          <div className="overlay" onClick={() => setSelectedDay(null)}>
            <div
              className="inline-workout-details"
              onClick={(e) => e.stopPropagation()}
            >
              <h4>Day {selectedDay} Workout Plan</h4>
              <ul>
                {workoutPlans[monthKey][selectedDay].map((ex, idx) => (
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
  );
};

export default Calendar;

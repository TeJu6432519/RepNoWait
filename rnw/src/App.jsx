import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import Dashboard from "./components/dashboard";
import Equipment from "./components/equipment";
import Booking from "./components/booking";
import Profile from "./components/profile"; // add Profile component

function App() {
  const [bookings, setBookings] = useState([
    { equipment: "Chest Press Machine", hour: 8, minute: 15, done: false },
    { equipment: "Treadmill", hour: 9, minute: 0, done: false },
  ]);

  return (
    <Routes>
      {/* Default login page */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard and other routes */}
      <Route path="/dashboard" element={<Dashboard bookings={bookings} setBookings={setBookings} />} />
      <Route path="/equipment" element={<Equipment bookings={bookings} setBookings={setBookings} />} />
      <Route path="/my-bookings" element={<Booking bookings={bookings} setBookings={setBookings} />} />

      {/* Profile route */}
      <Route path="/profile" element={<Profile />} />

      {/* Catch-all redirect unknown paths to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

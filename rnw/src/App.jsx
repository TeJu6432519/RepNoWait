import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/login";
import Dashboard from "./components/dashboard";
import Equipment from "./components/equipment";
import Booking from "./components/booking";

function App() {
  const [bookings, setBookings] = useState([
    { equipment: "Chest Press Machine", hour: 8, minute: 15, done: false },
    { equipment: "Treadmill", hour: 9, minute: 0, done: false },
  ]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard bookings={bookings} setBookings={setBookings} />} />
      <Route path="/equipment" element={<Equipment bookings={bookings} setBookings={setBookings} />} />
      <Route path="/my-bookings" element={<Booking bookings={bookings} setBookings={setBookings} />} />
    </Routes>
  );
}

export default App;

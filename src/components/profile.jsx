import React from "react";
import "./profile.css";
import { Edit2, Settings, Award, CalendarCheck, Dumbbell } from "lucide-react";

const Profile = () => {
  return (
    <div className="profile-page">
      <h2 className="profile-title">Gym Member Profile</h2>

      <div className="profile-header">
        <div className="avatar">JD</div>
        <div className="user-info">
          <h1 className="user-name">John Doe</h1>
          <p className="membership">Premium Member</p>
        </div>
        <button className="edit-btn">
          <Edit2 size={18} /> Edit Profile
        </button>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <Award size={28} />
          <div className="stat-info">
            <h2>45</h2>
            <p>Workouts Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <CalendarCheck size={28} />
          <div className="stat-info">
            <h2>12</h2>
            <p>Upcoming Bookings</p>
          </div>
        </div>
        <div className="stat-card">
          <Dumbbell size={28} />
          <div className="stat-info">
            <h2>8</h2>
            <p>Current Plan Exercises</p>
          </div>
        </div>
      </div>

      <div className="profile-settings">
        <h2>Account & Preferences</h2>
        <div className="settings-list">
          <div className="settings-item">
            <Settings size={18} />
            <span>Account Settings</span>
          </div>
          <div className="settings-item">
            <Settings size={18} />
            <span>Privacy Settings</span>
          </div>
          <div className="settings-item">
            <Settings size={18} />
            <span>Notifications</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useEffect, useState } from "react";
import "./profile.css";
import { Edit2, Settings, Award, CalendarCheck, Dumbbell, LogOut } from "lucide-react";
import { auth } from "../config/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const db = getFirestore();

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    workoutsCompleted: 0,
    upcomingBookings: 0,
    currentPlanExercises: 0,
    membership: "Premium Member",
  });

  const navigate = useNavigate(); // initialize navigate

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }
      } else {
        setUser(null);
        setProfileData({
          workoutsCompleted: 0,
          upcomingBookings: 0,
          currentPlanExercises: 0,
          membership: "Basic Member",
        });
        // Redirect to login if user is null
        navigate("/login", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/login", { replace: true }); // redirect to login after logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <h2>Please log in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h2 className="profile-title">Gym Member Profile</h2>

      <div className="profile-header">
        <div className="avatar">{user.displayName ? user.displayName[0] : "U"}</div>
        <div className="user-info">
          <h1 className="user-name">{user.displayName || "User Name"}</h1>
          <p className="membership">{profileData.membership}</p>
        </div>
        <button className="edit-btn">
          <Edit2 size={18} /> Edit Profile
        </button>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <Award size={28} />
          <div className="stat-info">
            <h2>{profileData.workoutsCompleted}</h2>
            <p>Workouts Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <CalendarCheck size={28} />
          <div className="stat-info">
            <h2>{profileData.upcomingBookings}</h2>
            <p>Upcoming Bookings</p>
          </div>
        </div>
        <div className="stat-card">
          <Dumbbell size={28} />
          <div className="stat-info">
            <h2>{profileData.currentPlanExercises}</h2>
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
          <div className="settings-item logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

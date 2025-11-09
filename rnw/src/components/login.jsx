import React, { useState } from 'react';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  CheckCircle,
  XCircle,
  UserPlus,
  LogIn,
  Chrome
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebaseConfig';

// --- Custom CSS (same as before) ---
const customCss = 

`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

:root {
  --bg-color: #0f0f1a;
  --card-bg: rgba(255, 255, 255, 0.05);
  --accent: #8b5cf6;
  --accent-glow: rgba(139, 92, 246, 0.6);
  --text: #fff;
  --muted: #a1a1aa;
  --error: #ef4444;
  --success: #22c55e;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--bg-color);
  font-family: 'Inter', sans-serif;
  color: var(--text);
  overflow: hidden;
}

/* ==============================
  CONTAINER LAYOUT
============================== */
.login-container {
  display: flex;
  flex-wrap: nowrap; /* allow panels to stack on smaller screens */
  min-height: 100vh;
  width: 100vw;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.right-panel .login-card {
  max-width: 450px;
  width: 100%;
  padding: 3rem;
}


.left-panel {
  width: 50%;
  min-width: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 20% 30%, #1e1e2e, #0f0f1a);
  position: relative;
  border-radius: 0;
  overflow: hidden;
  min-height: 100vh; /* make full height */
}

.right-panel {
  width: 50%; /* changed from 45% to 50% */
  min-width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(0,0,0,0.3));
  padding: 3rem;
  border-radius: 0;
  min-height: 100vh; /* make full height */
}



/* ==============================
  LEFT SIDE (LOGO)
============================== */
.pulse-circle {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: var(--accent-glow);
  filter: blur(120px);
  opacity: 0.3;
  animation: pulse 6s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.6; }
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;  /* horizontal center */
  justify-content: center; /* vertical center */
  z-index: 2;
  height: 100%; /* take full height of left-panel */
  padding: 2rem; /* optional spacing */
  transform: none; /* remove the translateX */
}


.logo {
  display: inline-block;
  background: black;
  border-radius: 50%;
  padding: 1.5rem;
  box-shadow: 0 0 40px var(--accent-glow);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.brand-title {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 1rem;
  color: var(--text);
}
.highlight-now {
  color: #beff7d; /* same green as your logo */

  font-weight: 700;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.brand-title:hover .highlight-now {
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.8), 0 0 30px rgba(0, 255, 136, 0.6);
}


.tagline {
  color: var(--muted);
  font-size: 1rem;
  margin-top: 0.25rem;
}

/* ==============================
  RIGHT SIDE (LOGIN CARD)
============================== */
.login-card {
  width: 100%;
  max-width: 480px; /* increased from 400px to 480px */
  background: var(--card-bg);
  padding: 3rem; /* slightly more padding for a bigger feel */
  border-radius: 1.5rem;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}


.login-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 40px rgba(139,92,246,0.3);
}

.login-title {
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
}

/* ==============================
  FORM ELEMENTS
============================== */
.input-group {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.05);
  border-radius: 0.75rem;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.75rem 1rem;
  transition: border 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: var(--accent);
}

.input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 1rem;
}

.toggle-visibility {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
}

.login-btn {
  width: 100%;
  background: var(--accent);
  color: white;
  font-weight: 600;
  padding: 0.9rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.login-btn:hover {
  background: #7c3aed;
  box-shadow: 0 0 20px var(--accent-glow);
}

.logo-img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 50%;
}


/* ==============================
  FOOTER TEXT
============================== */
.switch-mode {
  text-align: center;
  margin-top: 1.25rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.switch-mode span {
  color: var(--accent);
  cursor: pointer;
  font-weight: 500;
}

/* ==============================
  NOTIFICATIONS
============================== */
.error-msg, .success-msg {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.error-msg {
  color: var(--error);
}

.success-msg {
  color: var(--success);
}

/* Overlay for notification */
.notification-overlay {
  position: absolute;
  inset: 0; /* covers entire login card */
  background: rgba(0, 0, 0, 0.9); /* translucent dark */
  backdrop-filter: blur(5px); /* blur background */
  z-index: 5; /* behind notification */
}

/* Notification itself */
.notification {
  position: absolute;
  top: 20px; /* closer to top of card */
  left: 50%; /* center horizontally */
  transform: translateX(-50%);
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgba(255,255,255,0.1);
  animation: slideIn 0.4s ease;
  z-index: 10; /* above overlay */
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
}

`;
;

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('admin');
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      let userCredential;
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;
      setNotification({
        message: `${isSignup ? 'Account created' : 'Welcome back'}, ${loginType === 'admin' ? 'Admin' : 'Member'}!`,
        type: 'success',
      });

      setEmail('');
      setPassword('');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      console.error(err);
      let msg = err.message;
      if (msg.includes('auth/invalid-email')) msg = 'Invalid email address.';
      if (msg.includes('auth/missing-password')) msg = 'Please enter a password.';
      if (msg.includes('auth/email-already-in-use')) msg = 'This email is already registered.';
      if (msg.includes('auth/invalid-credential')) msg = 'Invalid credentials. Please try again.';
      if (msg.includes('auth/too-many-requests')) msg = 'Too many attempts. Try again later.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setNotification({
        message: 'Signed in with Google successfully!',
        type: 'success'
      });
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      console.error(err);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{customCss}</style>
      <div className="login-container">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="pulse-circle"></div>
          <div className="logo-container">
            <div className="logo">
              <img src={logo} alt="RepNoWait Logo" className="logo-img" />
            </div>
            <h1 className="brand-title">
              Rep<span className="highlight-now">NoW</span>ait
            </h1>
            <p className="tagline">Your workout waits for no one.</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="login-card">
            {notification && (
              <>
                <div className="notification-overlay"></div>
                <div className="notification">
                  {notification.type === 'success' ? (
                    <CheckCircle color="var(--success)" />
                  ) : (
                    <XCircle color="var(--error)" />
                  )}
                  <span>{notification.message}</span>
                </div>
              </>
            )}

            <h2 className="login-title">
              {isSignup
                ? 'Create Your Account'
                : loginType === 'admin'
                ? 'Admin Sign In'
                : 'Member Login'}
            </h2>

            <form onSubmit={handleAuth}>
              <div className="input-group">
                <label className="input-label">Email</label>
                <div className="input-wrapper">
                  <Mail size={18} color="var(--muted)" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} color="var(--muted)" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="error-msg">{error}</p>}

              <button className="login-btn" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Zap className="animate-spin" /> {isSignup ? 'Creating...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    {isSignup ? 'Sign Up' : 'Sign In'} <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <button
              className="login-btn"
              style={{ marginTop: '1rem', background: '#4285F4' }}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Chrome size={18} /> Continue with Google
            </button>

            <div className="switch-mode">
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <span onClick={() => setIsSignup(false)}>
                    Sign In
                  </span>
                </>
              ) : (
                <>
                  Don’t have an account?{' '}
                  <span onClick={() => setIsSignup(true)}>
                    Sign Up
                  </span>
                </>
              )}
            </div>

            <div className="switch-mode">
              {loginType === 'admin' ? (
                <>
                  Not an admin?{' '}
                  <span onClick={() => setLoginType('member')}>
                    Login as Member
                  </span>
                </>
              ) : (
                <>
                  Admin access?{' '}
                  <span onClick={() => setLoginType('admin')}>
                    Sign in here
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;

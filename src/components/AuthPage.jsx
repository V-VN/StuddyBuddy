import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage() {
  const { login, register, googleLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      console.error(err);
      setError("Authentication failed. Check details and try again.");
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    
    try {
      await googleLogin();
    } catch (err) {
      console.error(err);
      setError("Google login failed. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo">
          <h1>StudyBuddy</h1>
          <p>Your Buddy 4 Study!</p>
        </div>

        <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>
        
        {/* Google Button */}
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="google-btn"
        >
          <span>👤</span>
          {loading ? "Loading..." : "Continue with Google"}
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              disabled={loading}
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !email || !password}
            className="submit-btn"
          >
            {loading ? "Loading..." : (isRegister ? "Create Account" : "Sign In")}
          </button>
        </form>

        {error && <div className="error">{error}</div>}
        
        <div className="auth-toggle">
          <span>
            {isRegister 
              ? "Already have an account?" 
              : "Don't have an account?"
            }
          </span>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="link-button"
            disabled={loading}
          >
            {isRegister ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

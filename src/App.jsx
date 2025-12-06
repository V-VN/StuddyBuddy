import React, { useState } from "react";
import Planner from "./components/Planner.jsx";
import NotesEngine from "./components/NotesEngine.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import Motivation from "./components/Motivation.jsx";
import AuthPage from "./components/AuthPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const TABS = ["planner", "notes", "leaderboard", "motivation"];

export default function App() {
  const [activeTab, setActiveTab] = useState("planner");
  const { user, logout } = useAuth();

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>StudyBuddy</h1>
        <p>Your Buddy 4 Study!</p>
        <div className="header-right">
          <span className="user-email">{user.email}</span>
          <button onClick={logout}>Logout</button>
        </div>
        <nav className="nav">
          <button
            className={activeTab === "planner" ? "active" : ""}
            onClick={() => setActiveTab("planner")}
          >
            Dashboard / Planner
          </button>
          <button
            className={activeTab === "notes" ? "active" : ""}
            onClick={() => setActiveTab("notes")}
          >
            Notes Engine
          </button>
          <button
            className={activeTab === "leaderboard" ? "active" : ""}
            onClick={() => setActiveTab("leaderboard")}
          >
            Leaderboard
          </button>
          <button
            className={activeTab === "motivation" ? "active" : ""}
            onClick={() => setActiveTab("motivation")}
          >
            Motivation
          </button>
        </nav>
      </header>

      <main className="main">
        {activeTab === "planner" && <Planner />}
        {activeTab === "notes" && <NotesEngine />}
        {activeTab === "leaderboard" && <Leaderboard />}
        {activeTab === "motivation" && <Motivation />}
      </main>

      <footer className="footer">
        <p>StudyBuddy Hackathon Prototype (React + Gemini + Firebase)</p>
      </footer>
    </div>
  );
}

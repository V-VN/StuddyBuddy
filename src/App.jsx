import React, { useState } from "react";
import Planner from "./components/Planner.jsx";
import NotesEngine from "./components/NotesEngine.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import Motivation from "./components/Motivation.jsx";

const TABS = ["planner", "notes", "leaderboard", "motivation"];

export default function App() {
  const [activeTab, setActiveTab] = useState("planner");

  return (
    <div className="app">
      <header className="header">
        <h1>StudyBuddy</h1>
        <p>Your Buddy 4 Study!</p>
        <nav className="nav">
          <button
            className={activeTab === "planner" ? "active" : ""}
            onClick={() => setActiveTab("planner")}
          >
            Study Planner
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
        <p>StudyBuddy Hackathon Prototype (React + Gemini)</p>
      </footer>
    </div>
  );
}

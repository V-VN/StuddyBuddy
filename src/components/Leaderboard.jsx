import React, { useState, useEffect } from "react";

export default function Leaderboard() {
  const [name, setName] = useState("");
  const [points, setPoints] = useState(10);
  const [scores, setScores] = useState([]);

  // Dummy student data
  const dummyStudents = [
    { name: "Rahul Sharma", points: 1250, level: "Master", streak: 7 },
    { name: "Priya Patel", points: 1180, level: "Master", streak: 12 },
    { name: "Amit Kumar", points: 980, level: "Expert", streak: 5 },
    { name: "Sneha Gupta", points: 920, level: "Expert", streak: 9 },
    { name: "Vikram Singh", points: 850, level: "Pro", streak: 3 },
    { name: "Anjali Desai", points: 780, level: "Pro", streak: 15 },
    { name: "Rohan Mehta", points: 720, level: "Pro", streak: 2 },
    { name: "Divya Reddy", points: 680, level: "Advanced", streak: 8 },
  ];

  useEffect(() => {
    setScores(dummyStudents);
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim() || points < 1) return;

    setScores((prev) => {
      const existing = prev.find(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      );
      let updated;
      if (existing) {
        updated = prev.map((s) =>
          s.name.toLowerCase() === name.toLowerCase()
            ? { ...s, points: s.points + Number(points), streak: s.streak + 1 }
            : s
        );
      } else {
        updated = [...prev, { 
          name, 
          points: Number(points), 
          level: getLevel(Number(points)), 
          streak: 1 
        }];
      }
      return updated.sort((a, b) => b.points - a.points).slice(0, 10);
    });

    setName("");
    setPoints(10);
  };

  const getLevel = (points) => {
    if (points >= 1000) return "🏆 Master";
    if (points >= 800) return "🥈 Expert";
    if (points >= 500) return "🥉 Pro";
    if (points >= 200) return "🔥 Advanced";
    return "🌱 Beginner";
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "#ffd700";
    if (rank === 2) return "#c0c0c0";
    if (rank === 3) return "#cd7f32";
    return "#6b7280";
  };

  return (
    <section className="leaderboard-section">
      <div className="hero">
        <h2>🏆 Gamified Leaderboard</h2>
        <p className="subtitle">Compete with friends • Earn points • Level up!</p>
      </div>

      <div className="leaderboard-content">
        <div className="leaderboard-card">
          <div className="leaderboard-header">
            <h3>Top Students</h3>
            <div className="stats">
              <span>Total Players: {scores.length}</span>
              <span>🔥 Live Streak</span>
            </div>
          </div>

          <div className="table-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Points</th>
                  <th>Level</th>
                  <th>Streak</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((student, index) => (
                  <tr key={`${student.name}-${index}`} className={`rank-row rank-${index + 1}`}>
                    <td className="rank-cell">
                      <div 
                        className="rank-badge" 
                        style={{ backgroundColor: getRankColor(index + 1) }}
                      >
                        #{index + 1}
                      </div>
                    </td>
                    <td className="student-name">{student.name}</td>
                    <td className="points">
                      <span className="points-number">{student.points.toLocaleString()}</span>
                      <div className="points-bar">
                        <div 
                          className="points-fill" 
                          style={{ width: `${Math.min((student.points / 1500) * 100, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className="level-badge">{student.level}</span>
                    </td>
                    <td>
                      <div className="streak">
                        <span className="streak-number">{student.streak}</span>
                        <span className="streak-flame">🔥</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="form-card">
          <h3>Add Your Score</h3>
          <form onSubmit={handleAdd} className="score-form">
            <label>
              Your Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </label>
            <label>
              Points Earned
              <input
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                placeholder="e.g. 50"
                required
              />
            </label>
            <button type="submit" className="add-score-btn">
              🚀 Add Points & Climb!
            </button>
          </form>

          <div className="points-guide">
            <h4>How to earn points:</h4>
            <ul>
              <li>✅ Complete study session: +25 pts</li>
              <li>🎯 Finish quiz: +50 pts</li>
              <li>📝 Generate plan: +15 pts</li>
              <li>🔥 Daily streak: +10 pts/day</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
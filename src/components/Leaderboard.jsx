import React, { useState } from "react";

export default function Leaderboard() {
  const [name, setName] = useState("");
  const [points, setPoints] = useState(10);
  const [scores, setScores] = useState([]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim() || !points) return;

    setScores((prev) => {
      const existing = prev.find(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      );
      let updated;
      if (existing) {
        updated = prev.map((s) =>
          s.name.toLowerCase() === name.toLowerCase()
            ? { ...s, points: s.points + Number(points) }
            : s
        );
      } else {
        updated = [...prev, { name, points: Number(points) }];
      }
      return updated.sort((a, b) => b.points - a.points);
    });

    setName("");
    setPoints(10);
  };

  return (
    <section>
      <h2>Gamified Leaderboard</h2>
      <form onSubmit={handleAdd} className="card">
        <label>
          Student Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul"
            required
          />
        </label>
        <label>
          Points to Add
          <input
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            required
          />
        </label>
        <button type="submit">Add / Update Score</button>
      </form>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s, i) => (
              <tr key={s.name}>
                <td>{i + 1}</td>
                <td>{s.name}</td>
                <td>{s.points}</td>
              </tr>
            ))}
            {scores.length === 0 && (
              <tr>
                <td colSpan={3}>No scores yet. Add some!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

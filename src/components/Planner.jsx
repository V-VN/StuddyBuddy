import React, { useState } from "react";
import { generateText } from "../services/geminiClient.js";

export default function Planner() {
  const [goal, setGoal] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [days, setDays] = useState(10);
  const [topics, setTopics] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("Thinking...");

    const prompt = `
You are an AI study planner.
Create a concise day-wise plan for the following student:

Goal: ${goal}
Hours per day: ${hoursPerDay}
Days until exam: ${days}
Topics: ${topics}

Output in short bullet points, with focus tasks per day and revision tips.
`;
    const response = await generateText(prompt);
    setResult(response);
    setLoading(false);
  };

  return (
    <section>
      <h2>AI Study Planner</h2>
      <form onSubmit={handleGenerate} className="card">
        <label>
          Goal / Exam
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. BSc IT Sem 2 DSA"
            required
          />
        </label>
        <label>
          Hours per day
          <input
            type="number"
            min={1}
            max={24}
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(e.target.value)}
            required
          />
        </label>
        <label>
          Days until exam
          <input
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
          />
        </label>
        <label>
          Topics (comma separated)
          <textarea
            rows={3}
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="Arrays, Linked List, Trees, Graphs"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      </form>

      {result && (
        <div className="card output">
          <h3>Your Plan</h3>
          <pre>{result}</pre>
        </div>
      )}
    </section>
  );
}

import React, { useState } from "react";
import { generateText } from "../services/geminiClient.js";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { db, doc, updateDoc, collection, addDoc } from "../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function Planner() {
  const { user, profile, setProfile } = useAuth();

  // form / task state
  const [examName, setExamName] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [examDate, setExamDate] = useState("");
  const [tasks, setTasks] = useState([
    { id: 1, title: "", deadline: "", difficulty: "medium", minutes: 60 },
  ]);

  // AI output state
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  // add / change tasks
  const updateTask = (id, field, value) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const addTaskRow = () => {
    setTasks((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        title: "",
        deadline: "",
        difficulty: "medium",
        minutes: 60,
      },
    ]);
  };

  const removeTaskRow = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPlan(null);

    const cleanTasks = tasks.filter((t) => t.title.trim());
    const taskText = cleanTasks
      .map(
        (t, idx) =>
          `${idx + 1}. ${t.title} | deadline: ${t.deadline || "none"} | difficulty: ${
            t.difficulty
          } | estimated minutes: ${t.minutes}`
      )
      .join("\n");

    const prompt = `
You are an AI study planner for university students.

Create a prioritized, time-budgeted daily schedule from today until the exam.

Input:
- Exam: ${examName}
- Exam date: ${examDate || "not specified"}
- Available hours per day: ${hoursPerDay}
- Tasks (title, deadline, difficulty, estimated minutes):
${taskText || "No tasks listed"}

Constraints:
- Use all days until exam efficiently.
- Prefer earlier deadlines and higher difficulty.
- Do not exceed the daily available hours.

Output FORMAT (very important):
1) Overview (2–3 bullet points)
2) Time Budget Summary (table style text)
   - Total days
   - Total study hours
   - Total tasks
3) Daily Schedule (Day 1, Day 2, ...)
   - For each day show:
     • Main tasks with approximate minutes each
     • Priority (High/Medium/Low)
4) Tips (3 short bullet tips)

Keep everything concise and readable for UI rendering.
`;

    const response = await generateText(prompt);
    setPlan({ raw: response });
    setLoading(false);

    // basic stats update
    try {
      if (user && profile) {
        const userRef = doc(db, "users", user.uid);
        const addedMinutes = Number(hoursPerDay) * 60;
        await updateDoc(userRef, {
          sessionsCompleted: (profile.sessionsCompleted || 0) + 1,
          totalStudyMinutes: (profile.totalStudyMinutes || 0) + addedMinutes,
        });
        setProfile((prev) => ({
          ...prev,
          sessionsCompleted: (prev.sessionsCompleted || 0) + 1,
          totalStudyMinutes: (prev.totalStudyMinutes || 0) + addedMinutes,
        }));
        await addDoc(collection(db, "users", user.uid, "sessions"), {
          examName,
          hours: Number(hoursPerDay),
          createdAt: new Date(),
        });
      }
    } catch (err) {
      console.error("Failed to update stats", err);
    }
  };

  // demo chart data – you can later map from Firestore sessions
  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Planned study hours",
        data: [2, 3, 3, 4, 2, 5, 3],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.15)",
        tension: 0.35,
      },
    ],
  };

  const doughnutData = {
    labels: ["Easy", "Medium", "Hard"],
    datasets: [
      {
        data: [2, 5, 3],
        backgroundColor: ["#a7f3d0", "#60a5fa", "#f97373"],
      },
    ],
  };

  return (
    <section>
      <h2 className="planner-title">AI Study Planner</h2>
      <p className="planner-subtitle">
        Enter your tasks, deadlines and difficulty. StudyBuddy will prioritize and
        allocate time for you.
      </p>

      <form onSubmit={handleGenerate} className="card planner-card">
        <div className="planner-grid">
          <div className="field">
            <label>Exam / Goal</label>
            <input
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="e.g. BSc IT Sem 2 – DSA"
              required
            />
          </div>
          <div className="field">
            <label>Daily study hours</label>
            <input
              type="number"
              min={1}
              max={16}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Exam date (optional)</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
        </div>

        <h3 className="tasks-heading">Tasks & deadlines</h3>
        <div className="tasks-table-wrapper">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Deadline</th>
                <th>Difficulty</th>
                <th>Est. minutes</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td>
                    <input
                      value={t.title}
                      onChange={(e) =>
                        updateTask(t.id, "title", e.target.value)
                      }
                      placeholder="e.g. Revise Trees"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={t.deadline}
                      onChange={(e) =>
                        updateTask(t.id, "deadline", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={t.difficulty}
                      onChange={(e) =>
                        updateTask(t.id, "difficulty", e.target.value)
                      }
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={15}
                      step={15}
                      value={t.minutes}
                      onChange={(e) =>
                        updateTask(t.id, "minutes", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        className="small-btn danger"
                        onClick={() => removeTaskRow(t.id)}
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="planner-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={addTaskRow}
          >
            + Add task
          </button>
          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? "Generating plan..." : "Generate smart plan"}
          </button>
        </div>
      </form>

      {plan && (
        <div className="card output structured-output">
          <h3>Personalized Study Plan</h3>
          <div className="plan-content">
            {/* Render Gemini text with basic formatting */}
            {plan.raw.split("\n").map((line, idx) => {
              if (!line.trim()) return null;
              // headings
              if (/^\d\)/.test(line.trim())) {
                return (
                  <h4 key={idx} className="plan-section-title">
                    {line.replace(/^\d\)\s*/, "")}
                  </h4>
                );
              }
              // bullets
              if (/^[-•]/.test(line.trim())) {
                return (
                  <p key={idx} className="plan-bullet">
                    {line.replace(/^[-•]\s*/, "• ")}
                  </p>
                );
              }
              // fallback
              return (
                <p key={idx} className="plan-text">
                  {line}
                </p>
              );
            })}
          </div>
        </div>
      )}

      <div className="planner-charts">
        <div className="card">
          <h3>Your Weekly Study Hours</h3>
          <div className="chart-wrapper">
            <Line data={lineData} />
          </div>
        </div>

        <div className="card">
          <h3>Task Difficulty Mix</h3>
          <div className="chart-wrapper">
            <Doughnut data={doughnutData} />
          </div>
        </div>
      </div>
    </section>
  );
}

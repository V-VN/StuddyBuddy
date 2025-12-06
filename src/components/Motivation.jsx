import React, { useState, useEffect } from "react";

let intervalId = null;

export default function Motivation() {
  const [name, setName] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [status, setStatus] = useState("No reminders running.");

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const startReminders = async (e) => {
    e.preventDefault();
    const user = name.trim() || "Buddy";
    const mins = Number(minutes) || 30;

    if (intervalId) clearInterval(intervalId);

    if ("Notification" in window) {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.error(err);
      }
    }

    const send = () => {
      const msg = `${user}, it's time for a focused 25-minute study session. 💪`;
      setStatus(`Last reminder at ${new Date().toLocaleTimeString()}: ${msg}`);

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("StudyBuddy Reminder", { body: msg });
      }
    };

    send();
    intervalId = setInterval(send, mins * 60 * 1000);
    setStatus(`Reminders running every ${mins} minutes for ${user}.`);
  };

  return (
    <section>
      <h2>Motivation System</h2>
      <form onSubmit={startReminders} className="card">
        <label>
          Your Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul"
          />
        </label>
        <label>
          Reminder interval (minutes)
          <input
            type="number"
            min={1}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </label>
        <button type="submit">Start Reminders</button>
      </form>

      <div className="card output">
        <p>{status}</p>
      </div>
    </section>
  );
}

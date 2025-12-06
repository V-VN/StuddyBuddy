import React, { useState, useEffect } from "react";

export default function Motivation() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("study");
  const [customMessage, setCustomMessage] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [status, setStatus] = useState("No reminders scheduled.");
  const [scheduledReminders, setScheduledReminders] = useState([]);

  // Load reminders on mount
  useEffect(() => {
    loadReminders();
    // Check reminders every minute
    const checkInterval = setInterval(checkAndFireReminders, 60000);
    return () => clearInterval(checkInterval);
  }, []);

  // Save reminders whenever they change
  useEffect(() => {
    if (scheduledReminders.length > 0) {
      try {
        localStorage.setItem('studybuddy_reminders', JSON.stringify(scheduledReminders));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }
    }
  }, [scheduledReminders]);

  // Load reminders from localStorage
  const loadReminders = () => {
    try {
      const saved = localStorage.getItem('studybuddy_reminders');
      if (saved) {
        const reminders = JSON.parse(saved);
        setScheduledReminders(reminders.sort((a, b) => a.timestamp - b.timestamp));
      }
    } catch (error) {
      console.log("No existing reminders found");
    }
  };

  // Check and fire due reminders
  const checkAndFireReminders = () => {
    const now = Date.now();
    
    setScheduledReminders(prevReminders => {
      let updated = false;
      const newReminders = prevReminders.map(reminder => {
        if (reminder.timestamp <= now && !reminder.fired) {
          fireReminder(reminder);
          updated = true;
          return { ...reminder, fired: true };
        }
        return reminder;
      });
      
      if (updated) {
        localStorage.setItem('studybuddy_reminders', JSON.stringify(newReminders));
      }
      
      return newReminders;
    });
  };

  // Fire a reminder
  const fireReminder = async (reminder) => {
    const { subject, message } = buildSubjectAndMessage(reminder.name, reminder.type, reminder.customMessage);
    
    setStatus(`🔔 Reminder fired: ${message}`);

    // Browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(subject, { body: message });
    }

    // Send email
    await sendEmail(subject, message, reminder.email);
  };

  // Call backend email API
  const sendEmail = async (subject, message, toEmail) => {
    try {
      const res = await fetch("http://localhost:3002/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: toEmail,
          subject,
          message,
        }),
      });
      const data = await res.json();
      console.log("Email API response:", data);
      return true;
    } catch (error) {
      console.error("Email send error:", error);
      console.log("Note: Email backend not available. Reminder saved for browser notification only.");
      return false;
    }
  };

  const dailyQuotes = [
    "Believe in yourself — you are capable of amazing things!",
    "Small steps every day lead to big results.",
    "Consistency is more important than intensity. Keep going!",
    "Success is built on discipline, not motivation.",
    "Your future self will thank you for what you do today.",
  ];

  const buildSubjectAndMessage = (user, reminderType, customMsg = "") => {
    switch (reminderType) {
      case "study":
        return {
          subject: "StudyBuddy: Time to study",
          message: `${user}, it's time for a focused study session. 💪`,
        };
      case "test":
        return {
          subject: "StudyBuddy: Test reminder",
          message: `${user}, reminder: Prepare for your upcoming test! 📘`,
        };
      case "quiz":
        return {
          subject: "StudyBuddy: Quiz reminder",
          message: `${user}, don't forget to revise for your quiz! 📝`,
        };
      case "assignment":
        return {
          subject: "StudyBuddy: Assignment reminder",
          message: `${user}, finish your assignment — you got this! 📚`,
        };
      case "quote":
        return {
          subject: "StudyBuddy: Daily Motivation",
          message: dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)],
        };
      case "custom":
        return {
          subject: "StudyBuddy: Custom reminder",
          message: customMsg || `${user}, here is your reminder!`,
        };
      default:
        return {
          subject: "StudyBuddy reminder",
          message: `${user}, stay focused and keep learning!`,
        };
    }
  };

  const startReminders = async () => {
    const user = name.trim() || "Buddy";

    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    if (!dateTime) {
      alert("Please select a valid date and time for the reminder.");
      return;
    }

    if (type === "custom" && !customMessage.trim()) {
      alert("Enter your custom reminder message.");
      return;
    }

    const targetTime = new Date(dateTime).getTime();
    const now = Date.now();

    if (targetTime <= now) {
      alert("Please select a future date and time.");
      return;
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }

    // Create reminder object
    const reminder = {
      id: `reminder_${Date.now()}`,
      name: user,
      email: email.trim(),
      type,
      customMessage,
      timestamp: targetTime,
      fired: false,
      created: Date.now()
    };

    try {
      setScheduledReminders(prev => {
        const updated = [...prev, reminder].sort((a, b) => a.timestamp - b.timestamp);
        localStorage.setItem('studybuddy_reminders', JSON.stringify(updated));
        return updated;
      });
      
      setStatus(`✅ Reminder scheduled for ${new Date(dateTime).toLocaleString()}!`);
      
      // Clear form
      setName("");
      setEmail("");
      setCustomMessage("");
      setDateTime("");
      setType("study");
    } catch (error) {
      console.error("Error saving reminder:", error);
      setStatus("❌ Error saving reminder. Please try again.");
    }
  };

  const deleteReminder = (id) => {
    setScheduledReminders(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('studybuddy_reminders', JSON.stringify(updated));
      return updated;
    });
    setStatus("🗑️ Reminder deleted.");
  };

  const clearAllReminders = () => {
    if (window.confirm("Are you sure you want to delete all reminders?")) {
      setScheduledReminders([]);
      localStorage.removeItem('studybuddy_reminders');
      setStatus("🗑️ All reminders cleared.");
    }
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case "study": return "⏳";
      case "test": return "📘";
      case "quiz": return "📝";
      case "assignment": return "📚";
      case "quote": return "🌞";
      case "custom": return "✏️";
      default: return "🔔";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "10px" }}>Motivation & Email Reminder System</h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Schedule reminders that persist even after page refresh. Reminders will trigger browser notifications and send emails when due.
      </p>

      <div style={{ 
        backgroundColor: "#fff", 
        padding: "25px", 
        borderRadius: "12px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "30px"
      }}>
        <div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Your Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Reminder Type
            </label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            >
              <option value="study">⏳ Study Session</option>
              <option value="test">📘 Test Reminder</option>
              <option value="quiz">📝 Quiz Reminder</option>
              <option value="assignment">📚 Assignment Reminder</option>
              <option value="quote">🌞 Motivational Quote</option>
              <option value="custom">✏️ Custom Reminder</option>
            </select>
          </div>

          {type === "custom" && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Custom Reminder Message
              </label>
              <input
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your custom message..."
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Reminder Date & Time
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button 
            onClick={startReminders}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#4F46E5",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            Schedule Reminder
          </button>
        </div>
      </div>

      <div style={{ 
        backgroundColor: "#fff", 
        padding: "20px", 
        borderRadius: "12px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0 }}>Scheduled Reminders ({scheduledReminders.length})</h3>
          {scheduledReminders.length > 0 && (
            <button
              onClick={clearAllReminders}
              style={{
                padding: "8px 16px",
                backgroundColor: "#EF4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Clear All
            </button>
          )}
        </div>
        
        {scheduledReminders.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>No reminders scheduled.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {scheduledReminders.map((reminder) => (
              <div
                key={reminder.id}
                style={{
                  padding: "15px",
                  backgroundColor: reminder.fired ? "#F3F4F6" : "#F0F9FF",
                  borderRadius: "8px",
                  border: reminder.fired ? "1px solid #E5E7EB" : "1px solid #BAE6FD",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                    <span style={{ fontSize: "20px" }}>{getReminderIcon(reminder.type)}</span>
                    <strong>{reminder.name}</strong>
                    {reminder.fired && (
                      <span style={{ 
                        fontSize: "12px", 
                        backgroundColor: "#10B981", 
                        color: "white", 
                        padding: "2px 8px", 
                        borderRadius: "4px" 
                      }}>
                        Sent
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    📧 {reminder.email}
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    🕒 {new Date(reminder.timestamp).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#DC2626",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ 
        backgroundColor: "#FEF3C7", 
        padding: "15px", 
        borderRadius: "8px",
        border: "1px solid #FCD34D",
        marginBottom: "20px"
      }}>
        <p style={{ margin: 0, fontSize: "14px" }}>
          <strong>ℹ️ Status:</strong> {status}
        </p>
      </div>

      <div style={{ 
        backgroundColor: "#E0F2FE", 
        padding: "15px", 
        borderRadius: "8px",
        fontSize: "14px",
        color: "#0369A1"
      }}>
        <strong>📝 How it works:</strong>
        <ul style={{ margin: "10px 0 0 0", paddingLeft: "20px" }}>
          <li>Reminders are saved in your browser and persist after page refresh</li>
          <li>The system checks every minute for due reminders</li>
          <li>Browser notifications will appear when reminders trigger</li>
          <li>Emails are sent if the backend server is running on localhost:3002</li>
          <li>Keep this tab open or return to it for reminders to fire</li>
        </ul>
      </div>
    </div>
  );
}
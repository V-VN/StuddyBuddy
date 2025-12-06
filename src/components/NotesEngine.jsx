import React, { useState } from "react";
import { generateText } from "../services/geminiClient.js";

export default function NotesEngine() {
  const [rawNotes, setRawNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState("");
  const [topic, setTopic] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const handleSummarize = async () => {
    if (!rawNotes.trim()) return;
    setLoadingSummary(true);
    setSummary("Summarizing...");

    const prompt = `
Summarize these study notes in 5-7 short bullet points, focusing on exam-oriented concepts:

${rawNotes}
`;
    const response = await generateText(prompt);
    setSummary(response);
    setLoadingSummary(false);
  };

  const handleQuiz = async () =>    {
    if (!summary.trim() && !rawNotes.trim()) return;
    setLoadingQuiz(true);
    setQuiz("Generating quiz...");

    const sourceText = summary || rawNotes;
    const prompt = `
Create 5 MCQ questions based on the following content.
Each question should have 4 options (A–D) and mark the correct answer clearly:

${sourceText}
`;
    const response = await generateText(prompt);
    setQuiz(response);
    setLoadingQuiz(false);
  };

  const youtubeLinks = topic
    ? [
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          topic + " study tutorial"
        )}`,
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          topic + " for beginners"
        )}`,
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          topic + " revision"
        )}`,
      ]
    : [];

  return (
    <section>
      <h2>AI Notes Engine</h2>

      <div className="card">
        <h3>Summarizer</h3>
        <textarea
          rows={6}
          value={rawNotes}
          onChange={(e) => setRawNotes(e.target.value)}
          placeholder="Paste your lecture notes here..."
        />
        <button onClick={handleSummarize} disabled={loadingSummary}>
          {loadingSummary ? "Summarizing..." : "Summarize"}
        </button>
        {summary && (
          <div className="output">
            <h4>Summary</h4>
            <pre>{summary}</pre>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Quiz Maker</h3>
        <button onClick={handleQuiz} disabled={loadingQuiz}>
          {loadingQuiz ? "Generating..." : "Generate Quiz"}
        </button>
        {quiz && (
          <div className="output">
            <h4>Quiz</h4>
            <pre>{quiz}</pre>
          </div>
        )}
      </div>

      <div className="card">
        <h3>YouTube Suggestions</h3>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Binary Search Tree"
        />
        {youtubeLinks.length > 0 && (
          <ul>
            {youtubeLinks.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noreferrer">
                  Open YouTube search {i + 1}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

import React, { useState } from "react";
import { generateText } from "../services/geminiClient.js";
import * as pdfjsLib from "pdfjs-dist/webpack"; // PDF.js for browser

export default function NotesEngine() {
  const [rawNotes, setRawNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [score, setScore] = useState(null);
  const [topic, setTopic] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // PDF upload & parse
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingPdf(true);
    const reader = new FileReader();
    reader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      try {
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let textContent = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          const pageText = text.items.map((item) => item.str).join(" ");
          textContent += pageText + "\n\n";
        }
        setRawNotes(textContent);
      } catch (err) {
        console.error("PDF parsing error:", err);
      }
      setLoadingPdf(false);
    };
    reader.readAsArrayBuffer(file);
  };

  // Summarize text or PDF
  const handleSummarize = async () => {
    if (!rawNotes.trim()) return;
    setLoadingSummary(true);
    setSummary("Summarizing...");

    const prompt = `
Summarize these study notes in 5-7 concise bullet points for exam revision:

${rawNotes}
`;
    const response = await generateText(prompt);
    setSummary(response);
    setLoadingSummary(false);
  };

  // Generate quiz from text or PDF
  const handleQuiz = async () => {
    if (!summary.trim() && !rawNotes.trim()) return;
    setLoadingQuiz(true);
    setQuizQuestions([]);
    setSelectedOptions({});
    setScore(null);

    const sourceText = summary || rawNotes;
    const prompt = `
Create 6 multiple-choice questions based on the following content.

Return ONLY valid JSON in this exact format (no extra text):

[
  {
    "question": "text",
    "options": ["A", "B", "C", "D"],
    "answerIndex": 1
  }
]

Content:
${sourceText}
`;
    const response = await generateText(prompt);

    try {
      const jsonStart = response.indexOf("[");
      const jsonEnd = response.lastIndexOf("]");
      const jsonString =
        jsonStart !== -1 && jsonEnd !== -1
          ? response.slice(jsonStart, jsonEnd + 1)
          : response;

      const data = JSON.parse(jsonString);
      if (Array.isArray(data)) {
        setQuizQuestions(data);
      } else {
        setQuizQuestions([]);
      }
    } catch (e) {
      console.error("Failed to parse quiz JSON", e);
      setQuizQuestions([]);
    }
    setLoadingQuiz(false);
  };

  const handleOptionSelect = (qIndex, oIndex) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [qIndex]: oIndex,
    }));
  };

  const calculateScore = () => {
    if (!quizQuestions.length) return;
    let correct = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedOptions[idx] === q.answerIndex) correct += 1;
    });
    setScore({ correct, total: quizQuestions.length });
  };

  const effectiveTopic =
    topic.trim() ||
    (summary ? "summary " + summary.slice(0, 80) : rawNotes.slice(0, 80));

  const youtubeLinks = effectiveTopic
    ? [
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          effectiveTopic
        )}`,
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          effectiveTopic + " lecture"
        )}`,
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          effectiveTopic + " revision"
        )}`,
      ]
    : [];

  return (
    <section>
      <h2 className="notes-title">🚀 AI Notes Engine</h2>
      <p className="notes-subtitle">
        Upload PDF or paste notes. StudyBuddy gives you a smart summary, interactive quiz, and
        YouTube study paths.
      </p>

      {/* TOP HALF: upload + textarea */}
      <div className="card notes-top">
        <div className="notes-top-inner">
          <div className="notes-upload">
            <p className="notes-upload-title">Upload PDF</p>
            <input type="file" accept="application/pdf" onChange={handlePdfUpload} />
            {loadingPdf && <p>Parsing PDF...</p>}
          </div>

          <div className="notes-text">
            <label className="notes-text-label">Or paste your notes</label>
            <textarea
              rows={10}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="Paste your lecture notes or textbook paragraph here..."
            />
            <div className="notes-top-actions">
              <button onClick={handleSummarize} disabled={loadingSummary || loadingPdf}>
                {loadingSummary ? "Summarizing..." : "Analyze Notes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM GRID: SUMMARY + QUIZ + VIDEOS */}
      <div className="notes-bottom-grid">
        {/* Summary card */}
        <div className="card notes-bottom-card">
          <div className="notes-bottom-header">
            <span>🧠 Smart Summary</span>
          </div>
          <div className="notes-bottom-body">
            {summary ? (
              <pre className="notes-pre">{summary}</pre>
            ) : (
              <p className="notes-placeholder">
                Paste notes above or upload a PDF and click <strong>Analyze Notes</strong> to see
                your summary here.
              </p>
            )}
          </div>
        </div>

        {/* Interactive Quiz card */}
        <div className="card notes-bottom-card">
          <div className="notes-bottom-header">
            <span>🎯 Practice Quiz</span>
            <button
              type="button"
              className="notes-small-btn"
              onClick={handleQuiz}
              disabled={loadingQuiz || (!summary && !rawNotes)}
            >
              {loadingQuiz ? "Working..." : "Generate quiz"}
            </button>
          </div>
          <div className="notes-bottom-body">
            {quizQuestions.length === 0 ? (
              <p className="notes-placeholder">
                Generate an MCQ quiz from your notes or PDF and click on options to check your
                understanding.
              </p>
            ) : (
              <div className="quiz-list">
                {quizQuestions.map((q, qIndex) => (
                  <div key={qIndex} className="quiz-question">
                    <p className="quiz-question-text">
                      {qIndex + 1}. {q.question}
                    </p>
                    <div className="quiz-options">
                      {q.options.map((opt, oIndex) => {
                        const isSelected = selectedOptions[qIndex] === oIndex;
                        const isCorrect = score && oIndex === q.answerIndex;
                        const isWrong = score && isSelected && oIndex !== q.answerIndex;

                        return (
                          <button
                            key={oIndex}
                            type="button"
                            className={`quiz-option-btn ${
                              isSelected ? "selected" : ""
                            } ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                            onClick={() => handleOptionSelect(qIndex, oIndex)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="quiz-actions">
                  <button type="button" className="notes-small-btn" onClick={calculateScore}>
                    View score
                  </button>
                  {score && (
                    <span className="quiz-score">
                      Score: {score.correct}/{score.total}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Videos card */}
        <div className="card notes-bottom-card">
          <div className="notes-bottom-header">
            <span>📺 Video Suggestions</span>
          </div>
          <div className="notes-bottom-body">
            <input
              className="notes-topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic (e.g. Trees, Dynamic Programming)"
            />
            {youtubeLinks.length > 0 ? (
              <ul className="notes-links">
                {youtubeLinks.map((url, i) => (
                  <li key={i}>
                    <a href={url} target="_blank" rel="noreferrer">
                      YouTube search {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="notes-placeholder">
                Enter a topic, or paste notes / upload PDF above and we will use them as the search
                context.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

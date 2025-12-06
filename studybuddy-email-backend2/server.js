import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// API endpoint to send email
app.post("/send-email", async (req, res) => {
  const { to, subject, message } = req.body;

  console.log("Incoming /send-email:", req.body);

  if (!to || !subject || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.json({ success: true, msg: "Email sent!" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Start server
app.listen(process.env.PORT || 3002, () =>
  console.log(`Email server running on port ${process.env.PORT || 3002}`)
);

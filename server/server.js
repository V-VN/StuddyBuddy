import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config(); // Load .env

const app = express();
app.use(cors());
app.use(express.json());

// Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post("/send-whatsapp", async (req, res) => {
  const { message, to } = req.body;

  if (!message || !to) {
    return res.status(400).json({ error: "Message or number missing" });
  }

  try {
    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,       // FROM Twilio sandbox
      to: `whatsapp:${to}`,                         // TO user WhatsApp number
      body: message,
    });

    res.json({ success: true, sid: response.sid });
  } catch (err) {
    console.error("Twilio Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);

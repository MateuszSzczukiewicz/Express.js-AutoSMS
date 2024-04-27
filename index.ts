import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import express from "express";
import twilio from "twilio";
import schedule from "node-schedule";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  }),
);

app.post("/send-sms", async (req, res) => {
  try {
    const {
      message,
      dayOfMonth = "*",
      hour = "*",
      minute = "*",
      second = "*",
      month = "*",
      dayOfWeek = "*",
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const scheduleExpression = `${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

    const job = schedule.scheduleJob(scheduleExpression, async () => {
      try {
        const client = new twilio.Twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN,
        );
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.PHONE_NUMBER,
        });
        console.log("SMS sent successfully!");
      } catch (error) {
        console.error("Error sending SMS:", error);
      }
    });

    console.log("SMS scheduled at:", job.nextInvocation());

    res.status(200).json({ message: "SMS has been scheduled." });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
});

app.options("*", cors());

app.listen(process.env.PORT);

module.exports = app;

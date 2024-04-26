import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import express from "express";
import twilio from "twilio";
import schedule from "node-schedule";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  }),
);

const sendSMS = () => {
  const now = new Date();

  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    21,
    52,
    0,
  );

  const job = schedule.scheduleJob(date, async () => {
    try {
      const client = new twilio.Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
      await client.messages.create({
        body: "Hello from Twilio!",
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.PHONE_NUMBER,
      });
      console.log("SMS sent successfully!");
    } catch (error) {
      console.error("Error sending SMS:", error);
    }
  });

  console.log("SMS scheduled at:", job.nextInvocation());
};

sendSMS();

app.options("*", cors());

app.use(bodyParser.json());

app.listen(process.env.PORT);

module.exports = app;

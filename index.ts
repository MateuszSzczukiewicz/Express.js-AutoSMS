import express, { Request, Response } from "express";
import twilio from "twilio";
import schedule, { Job } from "node-schedule";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
let scheduledJobs: { [id: string]: Job } = {};

app.options("*", cors());

app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  }),
);

interface SendSMSRequestBody {
  id: string;
  message: string;
  dayOfMonth?: string;
  hour?: string;
  minute?: string;
  second?: string;
  month?: string;
  dayOfWeek?: string;
}

app.post("/send-sms", async (req: Request, res: Response) => {
  try {
    const {
      id,
      message,
      dayOfMonth = "*",
      hour = "*",
      minute = "*",
      second = "*",
      month = "*",
      dayOfWeek = "*",
    } = req.body as SendSMSRequestBody;

    if (!id || !message) {
      return res.status(400).json({ error: "ID and message are required." });
    }

    const scheduleExpression = `${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

    scheduledJobs[id] = schedule.scheduleJob(scheduleExpression, async () => {
      try {
        const client = new twilio.Twilio(
          process.env.TWILIO_ACCOUNT_SID!,
          process.env.TWILIO_AUTH_TOKEN!,
        );
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: process.env.PHONE_NUMBER!,
        });
        console.log("SMS sent successfully!");
      } catch (error) {
        console.error("Error sending SMS:", error);
      }
    });

    console.log("SMS scheduled at:", scheduledJobs[id].nextInvocation());

    res.status(200).json({ message: "SMS has been scheduled." });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
});

app.delete("/cancel-sms/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!scheduledJobs[id]) {
      return res
        .status(400)
        .json({ error: "No SMS scheduled with the provided ID." });
    }

    scheduledJobs[id].cancel();
    console.log("SMS with ID", id, "canceled.");

    res.status(200).json({ message: "Scheduled SMS has been canceled." });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while canceling the scheduled SMS." });
  }
});

app.listen(3000);

module.exports = app;

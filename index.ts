import express, { Request, Response } from "express";
import twilio from "twilio";
import schedule, { Job } from "node-schedule";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
let scheduledJob: Job | null = null;

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  }),
);

// Interface for the request body of /send-sms endpoint
interface SendSMSRequestBody {
  message: string;
  dayOfMonth?: string;
  hour?: string;
  minute?: string;
  second?: string;
  month?: string;
  dayOfWeek?: string;
}

// Handling POST request for sending SMS
app.post("/send-sms", async (req: Request, res: Response) => {
  try {
    const {
      message,
      dayOfMonth = "*",
      hour = "*",
      minute = "*",
      second = "*",
      month = "*",
      dayOfWeek = "*",
    } = req.body as SendSMSRequestBody;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Creating a schedule expression based on the provided values
    const scheduleExpression = `${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

    // Setting up a scheduled task to send SMS at the specified time and date
    scheduledJob = schedule.scheduleJob(scheduleExpression, async () => {
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

    console.log("SMS scheduled at:", scheduledJob.nextInvocation());

    res.status(200).json({ message: "SMS has been scheduled." });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
});

// Canceling scheduled SMS
app.post("/cancel-sms", async (req: Request, res: Response) => {
  try {
    if (!scheduledJob) {
      return res.status(400).json({ error: "No SMS scheduled to cancel." });
    }

    scheduledJob.cancel();
    console.log("SMS scheduled at:", scheduledJob.nextInvocation());

    res.status(200).json({ message: "Scheduled SMS has been canceled." });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while canceling the scheduled SMS." });
  }
});

app.options("*", cors());

app.use(bodyParser.json());

app.listen(process.env.PORT);

module.exports = app;

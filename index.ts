import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import express from "express";
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

app.get("/", (req, res) => {
  res.send("Hello World!");
})

app.options("*", cors());

app.use(bodyParser.json());

app.listen(process.env.PORT);

module.exports = app;
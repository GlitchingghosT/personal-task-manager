import dotenv from "dotenv";

import express from "express";
// step-1: Import express framework after installation.
import dns from "dns";

import mongoose from "mongoose";
// step-9: Import mongoose after installation to be able to connect to mongoDB.

// dns.setServers(["8.8.8.8", "8.8.4.4"]);

import cors from "cors";

const app = express();
// step-2: Activate express and put in a container called app.

dotenv.config();

const port = 2100;
// step-3: Define the port number for the server. don't use this same port number on your laptop.

app.use(cors());

import taskRouter from "./routes/taskRouter";

app.use(express.json());

app.use("/api/task", taskRouter);

// step-4: Go to package.json under script and put "dev": nodemon app.ts to allow npm run dev work

// step-6: Connect to mongoDB.

// step-7: To connect to mongoDB first install mongoose.

// step-8: Listen to both the database and the server together.

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Database connect successful");

  app.listen(port, () => {
    console.log(`server is running on PORT: ${port}`);
  });
  // step-5: Listen to the server after writing "npm run dev".
};

start();

// nwachiemma03_db_user
// RBeVZkmHgvcnYzvD
// mongodb://redacted.invalid/removed

// Server Files: this is where you run your server and connect to your database ===> from app.js ===> the model file
// Model Files: this is used to define our data structure that will enter our database ===> from the model file we go to the ===> controller file
// Controller Files(Business Logic): this file is used to define what happens between request and response. ===> from the controller files we go to the Routes files
// Routes Files: this defines the request type and the route for that particular request type. from here back to the father ===> server file (app.js)

// Other Files includes: middleware files, utility files e.t.c.

// Assignment

// CORS

// AXIOS

// import express from "express";
// import routes from "./routes.js";
// // TODO: complete me (loading the necessary packages)

// const app = express();

// // TODO: complete me (CORS)
// app.use(express.json());
// app.use('', routes);

// export default app;

import express from "express";
import routes from "./routes.js";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();

// CORS configuration: allow only the frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ origin: FRONTEND_URL }));

app.use(express.json());
app.use('', routes);

export default app;
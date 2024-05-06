// so help me GOD
import express, { Application, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import AppError from "./utils/appError";
import { globalErrorHandler } from "./controllers/errorHandler";

import authRouter from "./routes/authRoute";
import userRouter from "./routes/userRoute";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import xss, { filterXSS } from "xss";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { I_Request } from "./typescript/interfaces";
// import { whiteListMiddleware } from "./controllers/utilController";
// import compression from "compression"; TODO ADD THIS AND FIX RENDER ERROR
// LOAD CONFIG
dotenv.config({
  path: "./config.env",
});
const app: Application = express();
const env = process.env;
// foreign middlewares
app.use(
  express.json({
    limit: "10kb",
  })
);
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// enable trust proxy
app.set("trust proxy", 1);

// security middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "https://connectversemain.netlify.app/"],
  })
);
app.use(mongoSanitize());
// todo fix this
app.use((req: I_Request, res, next) => {
  // Sanitize request parameters, body, etc.
  if (req.body) {
    // Convert req.body to a string before sanitizing

    const body = filterXSS(JSON.stringify({ body: req.body }));
    req.body = JSON.parse(body).body;
  }
  if (req.query) {
    // Convert req.query to a string before sanitizing
    const query = filterXSS(JSON.stringify({ query: req.query }));
    req.query = JSON.parse(query).query;
  }

  next();
});
app.use(helmet());
// app.use(compression()); //compresses json in api
const limit = rateLimit({
  max: 100,
  windowMs: 1000 * 60 * 10, //10 min
});
app.use(limit);
// app.options("*", cors());

// local middlewares
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
// app.use("*",whiteListMiddleware)

// ping server
app.get("/ping", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "server up",
  });
});

// api requests that gets here needs to be handled by global error handler as no route has been found
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `Cannot find ${req.originalUrl}`));
});

// global error handler
app.use(globalErrorHandler);
export default app;

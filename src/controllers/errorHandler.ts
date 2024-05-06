import { Request, Response, NextFunction } from "express";
import {
  I_ErrorRequestHandler,
  I_ExpressError,
  I_RequestHandler,
} from "../typescript/interfaces";
import AppError from "../utils/appError";
const env = process.env;
function handleCastError(err: I_ExpressError) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(400, message);
}
function handleDuplicateFieldError(err: I_ExpressError) {
  const duplicateFields = Object.keys(err.keyValue);
  return new AppError(
    400,
    `${duplicateFields.join(", ")} already exist, kindly enter new value`
  );
}

function handleValidationError(err: I_ExpressError) {
  const incorrectFieldsMessage = Object.values(err.errors)
    .map((val: any) => val.message)
    .join(", ");
  const message = `${incorrectFieldsMessage}. please use other value(s)`;

  return new AppError(400, message);
}

const sendDevError = (err: I_ExpressError, req: Request, res: Response) => {
  console.log("[DEV ERROR 🔥🔥🔥]", err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendProductionError = (
  err: I_ExpressError,
  req: Request,
  res: Response
) => {
  if (err.isOperational) {
    // error is definitely from our class
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    return;
  }
  res.status(500).json({
    status: "error",
    message: "An error occurred",
  });
};

export function globalErrorHandler(
  err: I_ExpressError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (env.NODE_ENV === "development") {
    // we are in development
    sendDevError(err, req, res);
    return;
  }

  let error = { ...err };
  error.message = err.message;
  // we are in production
  console.log(err.name);
  // validation errors , occurs when mongoose schema is going through validations
  if (err.name === "ValidationError") error = handleValidationError(error);
  // duplicate errors, occurs when a post or put is made to an already existing unique field
  if (err.code === 11000) error = handleDuplicateFieldError(error);
  // handle cast error
  if (err.name === "CastError") error = handleCastError(err);
  sendProductionError(error, req, res);
}

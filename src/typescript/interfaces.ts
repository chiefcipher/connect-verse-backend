import { Request, Response, NextFunction } from "express";
import { I_User } from "../models/userModel";
export interface I_RequestHandler {
  (req: I_Request, res: Response, next: NextFunction): any;
}
export interface I_ErrorRequestHandler {
  (req: Request, res: Response, next: NextFunction): any;
}
export interface I_ExpressError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  code?: number; //comes from mongoose errors
  keyValue?: any; //actually an object from mongoose 11000 duplicated field error
  errors?: any; //actually an object from mongoose ValidationError
  path?: string;
  value?: string; //path and value comes from mongoose cast error
}

export interface I_Request extends Request {
  user?: I_User;
  query: any;
}

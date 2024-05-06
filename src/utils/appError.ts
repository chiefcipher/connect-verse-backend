class AppError extends Error {
  public status: string;
  public statusCode: number;
  public isOperational: boolean;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "failed" : "error";
    this.isOperational = true;
    //is operational lets us know its an error from here

    Error.captureStackTrace(this, this.constructor);
  }
}



export default AppError
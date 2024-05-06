import { I_RequestHandler } from "src/typescript/interfaces";

export const whiteListMiddleware:I_RequestHandler = (req,res,next) => {
  // console.log("ip: " +req.ip)

  next()
}
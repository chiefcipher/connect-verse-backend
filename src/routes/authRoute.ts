import { Router } from "express";
import {
  login,
  protect,

  signUp,
  updatePassword,
} from "../controllers/authController";

const authRouter = Router();
authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.put("/update_password", protect, updatePassword);


export default authRouter;

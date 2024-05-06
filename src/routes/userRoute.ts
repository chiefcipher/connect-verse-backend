import { Router } from "express";
import {
  getUsers,
  deleteAllUsers,
  updateUser,
  checkIfUserExists,
  usersWithSimilarInterest
} from "../controllers/userController";
import { getMe, protect, restrictTo,  } from "../controllers/authController";
import { E_Roles } from "../typescript/enums";
const userRouter = Router();
userRouter.post("/check", checkIfUserExists);
// the below route should be protected and restricted to super admin
userRouter.use(protect);
userRouter.get("/me", getMe);
userRouter.put("/:userId", updateUser);
userRouter.get("/:userId/similarInterests", usersWithSimilarInterest);
userRouter.use(restrictTo(E_Roles.super_admin));
userRouter.route("/").get(getUsers);
userRouter.delete("/deleteAll", deleteAllUsers);
export default userRouter;

import User, { I_User } from "../models/userModel";
import { E_Roles } from "../typescript/enums";
import { I_RequestHandler } from "../typescript/interfaces";
import AppError from "../utils/appError";
import { filterObject } from "../utils/functions";

export const getUsers: I_RequestHandler = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: "success",
      size: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAllUsers: I_RequestHandler = async (req, res, next) => {
  try {
    const { deletedCount } = await User.deleteMany({
      role: { $nin: [E_Roles.admin, E_Roles.super_admin] },
    });
    res.status(200).json({
      status: "success",
      size: deletedCount,
      message: "Users deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};


// sets role for a user
export const updateUser: I_RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (req.body.password || req.body.confirmPassword) {
      return next(new AppError(400, "This route is not for updating password"));
    }
    /*
     * email and username,password and confirm password cannot be updated,
     * only super_admin is allowed to assign role
     */

    const filteredObject = filterObject(req.body, [
      "tel",
      "fullName",
      "currency",
    ]);
    const user = await User.findByIdAndUpdate(userId, filteredObject, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};


export const checkIfUserExists: I_RequestHandler = async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username) return next(new AppError(404, "user does not exist"));
    const user = await User.findOne({ username });
    if (!user) return next(new AppError(404, "user does not exist"));
    res.status(200).json({
      status: "success",
      message: "user exists",
    });
  } catch (err) {
    next(err);
  }
};


export const usersWithSimilarInterest:I_RequestHandler =  async (req, res,next ) => {
  try {
    const userId = req.params.userId;
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's interests
    const userInterests = user.interests;

    // Find other users with similar interests
    const similarUsers = await User.find({ interests: { $in: userInterests }, _id: { $ne: userId } });

    res.json({
      status : 'success',
      data: {
        size:similarUsers.length,
        similarUsers
      }
    });
  } catch (error) {
    next(error)
  }
}
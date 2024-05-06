import { NextFunction, Response } from "express";
import User from "../models/userModel";
import { I_Request, I_RequestHandler } from "../typescript/interfaces";
import AppError from "../utils/appError";
import jwt from "jsonwebtoken";
import pug from "pug";
import crypto from "node:crypto";
// Generate a JWT token
const generateToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
export const signUp: I_RequestHandler = async (req, res, next) => {
  try {
    let user = new User({


     
      
  
      surname: req.body.surname,
      name: req.body.name,
      phone: req.body.phone,
      bio: req.body.bio,
      nationality: req.body.nationality,
      gender: req.body.gender,
      email: req.body.email,
      interests: req.body.interests,
      confirmPassword: req.body.confirmPassword,
      password: req.body.password,
      role: 'user',

    });
    user = await user.save();
    // TODO SEND SUCCESS SIGNUP MAIL
    user.password = undefined;
    const token = generateToken(user._id);
    res.status(200).json({
      status: "success",
      message: "Account created successfully, proceed to login",
      data: {
        token,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login: I_RequestHandler = async (req, res, next) => {
  try {
    // find user
    // identifier is email or username
    const { email, password } = req.body;

    if (!(email && password)) {
      return next(
        new AppError(400, `Kindly enter valid username or email with password`)
      );
    }
    const user = await User.findOne(
      { email: email }
  ).select("+password");

    // verify if password is correct
    if (!user || !(await user.isValidPassword(user.password!, password))) {
      return next(new AppError(401, "Invalid email or password "));
    }

    // Generate a JWT token
    const token = generateToken(user._id);
    // hide password
    user.password = undefined;

    res.status(200).json({
      status: "success",
      data: {
        token,
        user: user,
      },
    });
  } catch (err) {
    next(err);
  }
};

// protects a route to make sure its for logged in users
export const protect: I_RequestHandler = async (req, res, next) => {
  try {
    // get token
    const token =
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1];
    // check for authorization token

    if (!token) {
      return next(new AppError(400, "No authorization token"));
    }

    jwt.verify(token, process.env.JWT_SECRET!, async (err, decoded) => {
      if (err || !decoded)
        return next(new AppError(400, "Invalid or expired token"));
      const { id, iat } = decoded as any;
      const user = await User.findById(id);
      if (!user) return next(new AppError(404, "User no longer exists"));
      if (user.changedPasswordAfterToken(iat, user.passwordChangedAt)) {
        return next(
          new AppError(400, "User recently changed password, login again")
        );
      }
      req.user = user;
      next();
    });
  } catch (err) {
    next(err);
  }
};
// restrict a route access to certain roles
export const restrictTo = (...roles: Array<string>) => {
  return (req: I_Request, res: Response, next: NextFunction) => {
    if (!(req.user && roles.includes(req.user.role))) {
      return next(new AppError(403, "Unauthorized"));
    }
    next();
  };
};

// update password
export const updatePassword: I_RequestHandler = async (req, res, next) => {
  try {
    const { userId, currentPassword, newPassword, newPasswordConfirm } =
      req.body;
    if (!(userId && currentPassword && newPassword && newPasswordConfirm)) {
      return next(new AppError(400, "Invalid parameters"));
    }

    // find user
    let user = await User.findById(userId).select("+password");
    if (!user) return next(new AppError(404, "user does not exist"));
    // check if current password is valid
    const isValidPassword = await user.isValidPassword(
      user.password!,
      currentPassword
    );
    if (!isValidPassword) {
      return next(new AppError(400, "Invalid current password"));
    }
    user.password = newPassword;
    user.confirmPassword = newPasswordConfirm;
    user = await user.save();
    const token = generateToken(user._id);
    user.password = undefined;
    res.status(200).json({
      status: "success",
      token,
      message: "password updated successfully",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Route to get details of the currently logged-in user
export const getMe: I_RequestHandler = async (req, res, next) => {
  try {
    // Fetch the user details from the database using the authenticated user's _id
    const user = await User.findById(req.user?._id);

    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};



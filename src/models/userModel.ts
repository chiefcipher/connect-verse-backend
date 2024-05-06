import mongoose, { Schema, Document, model, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import { E_Roles } from "../typescript/enums";
import crypto from "node:crypto";

export interface I_User extends Document {
  email: string;

  name: string;
  role: string;
  phone: string;
  surname: string;
  bio: string;
  nationality: string;
  gender: string;
  primaryInterest?: string;
  interests: string[];

  password?: string;
  confirmPassword?: string;
  createdAt: Date;
  // role: string;

  passwordResetHash?: string;
  passwordResetTokenExpiresAt?: number;
  passwordChangedAt?: number;
  isValidPassword: (hash: string, password: string) => Promise<boolean>;
  changedPasswordAfterToken: (
    jwt_iat: number,
    changedPasswordTimestamp?: number
  ) => boolean;
  generateResetHash: () => { hash: string; resetToken: string };
  [key: string]: any;
  calcPercentChange: (oldBalance: number, newBalance: number) => number;
}

const userSchema = new Schema<I_User>({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "Email is required"],
    validate: [validator.isEmail, "Enter valid email"],
  },

  name: {
    type: String,
    minlength: [3, "Name must be at least 3 characters"],
    maxlength: [50, "Name must be at most 50 characters"],
    required: [true, "Name is required"],
  },
  surname: {
    type: String,
    minlength: [3, "surname must be at least 3 characters"],
    maxlength: [50, "surname must be at most 50 characters"],
    required: [true, "surname is required"],
  },

  phone: {
    type: String,
    required: [true, "Telephone is required"],
  },

  bio: {
    type: String,
    required: [true, "Bio is required"],
  },
  nationality: {
    type: String,
    required: [true, "Nationality is required"],
  },
  gender: {
    type: String,
    required: [true, "Gender is required"],
  },
  role: {
    type: String,
    enum: [E_Roles.user, E_Roles.admin, E_Roles.super_admin],
    default: "user",
  },

  primaryInterest: {
    type: String,
  },
  interests: {
    type: [String],
    required: [true, "Interests is required "],
  },
  password: {
    type: String,
    minlength: [8, "password must be at least 8 characters"],
    maxlength: [50, "password must be at most 50 characters"],
    select: false,
  },
  confirmPassword: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  passwordChangedAt: Date,
  passwordResetHash: String,
  passwordResetTokenExpiresAt: Number,
});
// validate confirmPassword and password
userSchema.pre("validate", function (next) {
  if (this.confirmPassword !== this.password) {
    this.invalidate("confirmPassword", "passwords do not match");
  }
  next();
});
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // we have modified password, create hash
    const hash = await bcrypt.hash(this.password!, 12);
    this.password = hash;
    this.confirmPassword = undefined; //remove confirm password

    return next();
  }

  // we have not modified password, do nothing
  next();
});

userSchema.pre("save", function (next) {
  if (this.isModified("profileBalance")) {
    console.log("we modified profile balance ");
    return next();
  }
  return next();
});

// set password changed at if password field is modified
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now();
  next();
});

// a method to check if password is valid
userSchema.methods.isValidPassword = async function (
  hash: string,
  password: string
) {
  const isValidPassword = await bcrypt.compare(password, hash);
  return isValidPassword;
};
// check if user changed password
userSchema.methods.changedPasswordAfterToken = function (
  jwt_iat: number,
  changedPasswordDate: number | undefined
) {
  if (!changedPasswordDate) return false;
  // jwt_iat is timestamp in sec while changedPasswordDate is timestamp in ms
  return changedPasswordDate > jwt_iat * 1000;
};

// calculates the percent change when updating balance
userSchema.methods.calcPercentChange = function (
  oldBalance: number,
  newBalance: number
) {
  const percentChange = ((newBalance - oldBalance) / oldBalance || 1) * 100;
  return percentChange;
};
// generate resetToken and resetTokenHash
userSchema.methods.generateResetHash = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(resetToken).digest("hex");
  return {
    hash,
    resetToken,
  };
};
const User: Model<I_User> = model<I_User>("User", userSchema);
export default User;

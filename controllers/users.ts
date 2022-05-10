import express from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import fs from "fs";

import HttpError from "../models/http-error";
import User from "../models/user";

export const getUser = async ({
  res,
  next,
}: {
  res: express.Response;
  next: express.NextFunction;
}) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError("Fetching user failed", 500);
    return next(error);
  }

  res.json({
    user: users.map((user) => {
      return user.toObject({ getters: true });
    }),
  });
};

export const signup = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Please check your data.", 422));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signup failed.", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User exists already.", 422);
    return next(error);
  }

  let hashedPassword: string;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user.", 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file?.path,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed.", 500);
    return next(error);
  }

  let token: string;
  try {
    token = jwt.sign({ userId: createdUser.id }, "supersecret_dont_share", {
      expiresIn: "1h",
    });
  } catch (err) {
    const error = new HttpError("Signing up failed.", 500);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token });
};

export const login = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Logging in failed.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Invalid credentials, login failed.", 403);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch {
    const error = new HttpError("Login failed.", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid credentials, login failed.", 403);
    return next(error);
  }

  let token: string;
  try {
    token = jwt.sign({ userId: existingUser.id }, "supersecret_dont_share", {
      expiresIn: "1h",
    });
  } catch (err) {
    const error = new HttpError("Signing up failed.", 500);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: existingUser.id, email: existingUser.email, token });
};

export const updateUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("could not update user.", 422));
  }

  const { name, email } = req.body;
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("could not update user.", 500);
    return next(error);
  }

  user.name = name;
  user.email = email;

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError("could not update user.", 500);
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch {
    const error = new HttpError("could not delete user.", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for this id.", 404);
    return next(error);
  }

  const imagePath = user.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await user.remove({ session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError("could not delete user.", 500);
    return next(error);
  }

  if (imagePath) {
    fs.unlink(imagePath, (err) => {
      console.log(err);
    });
  }

  res.status(200).json({ message: "Deleted user." });
};

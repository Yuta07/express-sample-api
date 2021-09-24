import { NextFunction } from "express";
import { validationResult } from "express-validator";
import { v4 } from "uuid";

import HttpError from "../models/http-error";

let DUMMY_USERS = [
  { id: "1", username: "test", password: "blahblah" },
  { id: "2", username: "beautiful", password: "foobar" },
];

export const signup = (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError("Invalid inputs passed. please check your data.", 422);
  }

  const { username, password } = req.body;

  const hasUser = DUMMY_USERS.find((user) => {
    user.username === username;
  });

  if (hasUser) {
    throw new HttpError("Could not create user. username already exsit.", 422);
  }

  const createdUser = {
    id: v4(),
    username,
    password,
  };

  DUMMY_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

export const login = (req, res) => {
  const { username, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((user) => {
    user.username === username;
  });

  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      "Could not identify user. credentials seem to be wrong.",
      404
    );
  }

  res.json({ message: "Logged in!" });
};

export const getUserById = (req, res, next: NextFunction) => {
  const userId = req.params.uid;
  const user = DUMMY_USERS.filter((user) => {
    return user.id === userId;
  });

  if (!user || user.length === 0) {
    return next(new HttpError("Could not find a user", 404));
  }

  res.json({
    user,
  });
};

export const updateUserByID = (req, res) => {
  const { username } = req.body;
  const userId = req.params.uid;

  const updateUser = DUMMY_USERS.find((user) => user.id === userId);
  const userIndex = DUMMY_USERS.findIndex((user) => user.id === userId);

  if (updateUser) {
    updateUser.username = username;
    DUMMY_USERS[userIndex] = updateUser;
  }

  res.status(200).json({ user: updateUser });
};

export const deelteUserByID = (req, res) => {
  const userId = req.params.uid;
  if (!DUMMY_USERS.find((user) => user.id === userId)) {
    throw new HttpError("Could not find user for that id.", 404);
  }
  DUMMY_USERS = DUMMY_USERS.filter((user) => user.id !== userId);
  console.log(DUMMY_USERS);

  res.status(200).json({ message: "Deleted user." });
};

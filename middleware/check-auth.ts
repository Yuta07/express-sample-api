import express, { NextFunction } from "express";
import jwt from "jsonwebtoken";

import HttpError from "../models/http-error";

export const checkAuth = ({
  req,
  next,
}: {
  req: express.Request;
  next: NextFunction;
}) => {
  console.log(req);
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, "supersecret_dont_share");
    req["userData"] = { userId: decodedToken["userId"] };
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed.", 403);
    return next(error);
  }
};

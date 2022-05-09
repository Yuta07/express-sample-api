import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import express from "express";

import HttpError from "./models/http-error";
import userRoutes from "./routes/users";

import type { Express } from "express";

type Error = {
  code: number;
  message: string;
};

const app: Express = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

    next();
  }
);

app.use("/api/users", userRoutes);

app.use(() => {
  const error = new HttpError("Could not find this route", 404);

  return error;
});

app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (req["file"]) {
      fs.unlink(req["file"]["path"], (err) => {
        console.log(err);
      });
    }

    if (res.headersSent) {
      return next(error);
    }

    res.status(error.code || 500);
    res.json({ message: error.message || "An unknown error occured" });
  }
);

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MongoURL || "")
  .then(() => {
    app.listen(port);
  })
  .catch((err: Error) => {
    console.log(err);
  });

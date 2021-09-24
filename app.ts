import express, { NextFunction } from "express";

import HttpError from "./models/http-error";

import roomRoutes from "./routes/rooms";
import userRoutes from "./routes/users";

type Error = {
  code: number;
  message: string;
};

const app: express.Express = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(() => {
  const error = new HttpError("Could not find this route", 404);

  return error;
});

app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

app.use(
  (
    error: Error,
    req: Express.Request,
    res: Express.Response,
    next: NextFunction
  ) => {
    console.log(req);
    if (res["headerSent"]) {
      return next(error);
    }

    res["status"](error.code || 500);
    res["json"]({ message: error.message || "An unknown error occured" });
  }
);

const port = process.env.PORT || 5000;
app.listen(port);

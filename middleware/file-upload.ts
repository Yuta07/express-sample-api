import express from "express";
import multer, { FileFilterCallback } from "multer";
import { v4 } from "uuid";

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

export const fileUpload = multer({
  limits: { fileSize: 500000 },
  storage: multer.diskStorage({
    destination: (
      req: express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) => {
      console.log(req, file);

      cb(null, "uploads/images");
    },
    filename: (req: express.Request, file, cb) => {
      console.log(req);

      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, v4() + "." + ext);
    },
  }),
  fileFilter: (req: express.Request, file, cb: FileFilterCallback) => {
    console.log(req);

    const isValid = !!MIME_TYPE_MAP[file.mimetype];

    if (isValid) return;

    let error = new Error("Invalid mime type!");
    cb(error);
  },
});

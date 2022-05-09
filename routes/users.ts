import express from "express";
import { check } from "express-validator";

import { login, signup } from "../controllers/users";
// import { fileUpload } from "../middleware/file-upload";

const router = express.Router();

router.post(
  "/signup",
  // fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  signup
);
router.post("/login", login);

export default router;

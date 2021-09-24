import express from "express";
import { check } from "express-validator";

import {
  deelteUserByID,
  getUserById,
  login,
  signup,
  updateUserByID,
} from "../controllers/users";

const router = express.Router();

router.post(
  "/signup",
  [check("username").not().isEmpty(), check("password").isLength({ min: 8 })],
  signup
);
router.post("/login", login);

router.get("/:uid", getUserById);
router.patch("/:uid", updateUserByID);
router.delete("/:uid", deelteUserByID);

export default router;

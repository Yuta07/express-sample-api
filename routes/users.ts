import express from "express";
import { check } from "express-validator";

import { deleteUser, login, signup, updateUser } from "../controllers/users";
// import { checkAuth } from "../middleware/check-auth";
import { fileUpload } from "../middleware/file-upload";

const router = express.Router();

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  signup
);
router.post("/login", login);

// router.use(checkAuth);

router.patch(
  "/:uid",
  [check("name").not().isEmpty(), check("email").normalizeEmail().isEmail()],
  updateUser
);

router.delete("/:uid", deleteUser);

export default router;

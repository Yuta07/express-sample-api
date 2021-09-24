import express from "express";
import { check } from "express-validator";

import {
  createRoom,
  deleteRoomByID,
  getRoomById,
  updateRoomByID,
} from "../controllers/rooms";

const router = express.Router();

router.get("/rid", getRoomById);
router.get("/", [check("roomname").not().isEmpty()], createRoom);
router.patch("/:rid", [check("roomname").not().isEmpty()], updateRoomByID);
router.delete("/:rid", deleteRoomByID);

export default router;

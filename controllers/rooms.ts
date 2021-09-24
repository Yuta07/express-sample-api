import { NextFunction } from "express";
import { validationResult } from "express-validator";
import { v4 } from "uuid";

import HttpError from "../models/http-error";

let DUMMY_ROOMS = [
  { id: "1", roomname: "original", slug: "blah" },
  { id: "2", roomname: "ordinary", slug: "foobaz" },
];

export const getRoomById = (req, res, next: NextFunction) => {
  const roomId = req.params.rid;
  const room = DUMMY_ROOMS.filter((room) => {
    return room.id === roomId;
  });

  if (!room || room.length === 0) {
    return next(new HttpError("Could not find a user", 404));
  }

  res.json({
    room,
  });
};

export const createRoom = (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError("Invalid inputs passed. please check your data.", 422);
  }

  const { roomname } = req.body;

  const createdRoom = {
    id: (Number(DUMMY_ROOMS.slice(-1)[0].id) + 1).toString(),
    roomname,
    slug: v4(),
  };

  DUMMY_ROOMS.push(createdRoom);

  res.status(201).json({ room: createdRoom });
};

export const updateRoomByID = (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError("Invalid inputs passed. please check your data.", 422);
  }

  const { roomname } = req.body;
  const roomId = req.params.rid;

  const updateRoom = DUMMY_ROOMS.find((room) => room.id === roomId);
  const roomIndex = DUMMY_ROOMS.findIndex((room) => room.id === roomId);

  if (updateRoom) {
    updateRoom.roomname = roomname;
    DUMMY_ROOMS[roomIndex] = updateRoom;
  }

  res.status(200).json({ room: updateRoom });
};

export const deleteRoomByID = (req, res) => {
  const roomId = req.params.rid;
  DUMMY_ROOMS = DUMMY_ROOMS.filter((room) => room.id !== roomId);
  console.log(DUMMY_ROOMS);

  res.status(200).json({ message: "Deleted room." });
};

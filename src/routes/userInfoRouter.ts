import dotenv from "dotenv";
dotenv.config();
import { Router } from "express";
import mongoose from "mongoose";

import { Weight } from "../models/userInfoModel.js";
import UserInfo from "../models/userInfoModel.js";
import { sortWeightLog, parseWeightLogSent } from "../utils/userInfoUtils.js";

const userInfoRouter = Router();

userInfoRouter.get("/userInfo", async (req, res) => {
  const userInfoId = req.body.userInfoId;

  await mongoose.connect(process.env.MONGODB_URI as string);
  const userInfo = await UserInfo.findById(userInfoId);

  res.json(userInfo);
});
// update user info?

userInfoRouter.post("/userInfo/weightLog", async (req, res) => {
  const userInfoId = req.body.userInfoId;

  await mongoose.connect(process.env.MONGODB_URI as string);

  const userInfo = await UserInfo.findById(userInfoId);

  if (!userInfo) {
    throw new Error("User not found");
  }

  const weightLog = parseWeightLogSent(req.body.weightLog);
  // verify integrity of weight log here!

  sortWeightLog(weightLog);
  
  userInfo.weightLog = weightLog;
  await userInfo.save();

  res.status(200).send({ weightLog: weightLog });
});

export default userInfoRouter;

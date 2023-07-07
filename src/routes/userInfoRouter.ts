import dotenv from "dotenv";
dotenv.config();
import { Router } from "express";
import { Weight } from "../models/userInfoModel.js";
import UserInfo from "../models/userInfoModel.js";
import mongoose from "mongoose";

const userInfoRouter = Router();

function compareDates(firstDate: Date, secondDate: Date) {
  const firstDateInfo = {
    year: firstDate.getFullYear(),
    month: firstDate.getMonth(),
    day: firstDate.getDay(),
  };

  const secondDateInfo = {
    year: secondDate.getFullYear(),
    month: secondDate.getMonth(),
    day: secondDate.getDay(),
  };

  if (firstDateInfo.year > secondDateInfo.year) {
    return true;
  } else if (firstDateInfo.year < secondDateInfo.year) {
    return false;
  }

  if (firstDateInfo.month > secondDateInfo.month) {
    return true;
  } else if (firstDateInfo.month < secondDateInfo.month) {
    return false;
  }

  if (firstDateInfo.day > secondDateInfo.day) {
    return true;
  } else {
    return false;
  }
}

function sortWeightLog(weightLog: Weight[]): void {
  weightLog.sort((a, b) => compareDates(a.date, b.date) ? 1 : -1);
}

userInfoRouter.get("/userInfo", async (req, res) => {
  const userInfoId = req.body.userInfoId;

  await mongoose.connect(process.env.MONGODB_URI as string);
  const userInfo = await UserInfo.findById(userInfoId);

  res.json(userInfo);
});

userInfoRouter.post("/userInfo/weightLog", async (req, res) => {
  const userInfoId = req.body.userInfoId;

  await mongoose.connect(process.env.MONGODB_URI as string);

  const userInfo = await UserInfo.findById(userInfoId);
  if (!userInfo) {
    throw new Error("User not found");
  }
  let weightLog: Weight[] = ((weightLogSent): Weight[] => {
    return weightLogSent.map((
      weight: { weightKg: number; date: string },
    ) => {
      return {
        weightKg: Number(weight.weightKg),
        date: new Date(weight.date),
      };
    });
  })(req.body.weightLog);

  sortWeightLog(weightLog);
  
  userInfo.weightLog = weightLog;
  await userInfo.save();

  res.status(200).send({ weightLog: weightLog });

});

export default userInfoRouter;

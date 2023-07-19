import env from "dotenv";
env.config();
import { Router } from "express";
import { connect as mongooseConnect, Error as mongooseError } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import UserCredentials from "../models/userCredentialsModel.js";
import { Sex } from "../models/userInfoModel.js";
import UserInfo from "../models/userInfoModel.js";
import {
  areCredentialsValid,
  expiresInDays,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/authUtils.js";

const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const userCredentialsSent = {
    email: req.body.email,
    password: req.body.password,
  };

  if (!areCredentialsValid(userCredentialsSent)) {
    return res.status(401).json({ message: "credentials are invalid!" });
  }

  await mongooseConnect(process.env.MONGODB_URI as string);

  const userCredentials = await UserCredentials.findOne({
    email: userCredentialsSent.email,
  });

  if (!userCredentials) {
    return res.status(401).json({ message: "invalid email or password" });
  }

  const isPasswordCorrect = await bcrypt.compare(
    userCredentialsSent.password,
    userCredentials.password,
  );

  if (!isPasswordCorrect) {
    return res.status(401).json({ message: "invalid email or password" });
  }

  // we are sending the cookie in the response body temporarily be aware! CHANGETHIS!
  res.cookie(
    "refreshToken",
    generateRefreshToken(
      userCredentials._id,
      userCredentials.userInfoId,
    ),
    {
      expires: expiresInDays(15),
      signed: true,
      httpOnly: true,
      secure: true,
    },
  );
  return res.status(200).json({
    accessToken: generateAccessToken(
      userCredentials._id,
      userCredentials.userInfoId,
    ),
    refreshTokenCookie: res.getHeader("set-cookie"),
  });
});

authRouter.post("/register", async (req, res) => {
  const userCredentialsSent = {
    email: req.body.email,
    password: req.body.password,
  };
  if (!areCredentialsValid(userCredentialsSent)) {
    res.status(401).json({ message: "invalid credentials" });
    return;
  }

  await mongooseConnect(process.env.MONGODB_URI as string);

  const userInfo = new UserInfo({
    email: userCredentialsSent.email,
    sex: Sex.Other,
    weightLog: [],
  });

  const userCredentials = new UserCredentials({
    email: userCredentialsSent.email,
    password: await bcrypt.hash(userCredentialsSent.password, 10),
    userInfoId: userInfo._id,
  });

  try {
    await userCredentials.save();
    await userInfo.save();
  } catch (error) {
    res.status(401).json({ message: (error as mongooseError).message });
    return;
  }

  res.cookie(
    "refreshToken",
    generateRefreshToken(
      userCredentials._id,
      userCredentials.userInfoId,
    ),
    {
      expires: expiresInDays(15),
      signed: true,
      httpOnly: true,
      secure: true,
    },
  );
  return res.status(200).json({
    accessToken: generateAccessToken(
      userCredentials._id,
      userCredentials.userInfoId,
    ),
    refreshTokenCookie: res.getHeader("set-cookie"),
  });
});

authRouter.get("/token", async (req, res, next) => {
  const refreshToken: string = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401);
    next(new Error("No refresh token provided."));
    return;
  }

  const { userCredentialsId, userInfoId } = jwt.verify(
    refreshToken,
    process.env.REFRESH_SECRET as string,
  ) as jwt.JwtPayload;

  res
    .status(200)
    .json({
      accessToken: generateAccessToken(userCredentialsId, userInfoId),
    });
});

export default authRouter;

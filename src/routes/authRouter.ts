import env from "dotenv";
env.config();
import { Router } from "express";
import { Error as mongooseError, connect as mongooseConnect } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import UserCredentials from "../models/userModel.js";
import UserInfo from "../models/userInfoModel.js";
import {
  areCredentialsValid,
  generateAccessToken,
  generateRefreshToken,
  expiresInDays,
} from "../utils/authUtils.js"

const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const userCredentialsSent = {
    email: req.body.email,
    password: req.body.password,
  };
  console.log(req.cookies);
  console.log(req.signedCookies);
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
      expires: expiresInDays(10),
      signed: true,
      // httpOnly: true,
      // secure: true,
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
    sex: "other",
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

  return res.status(200).json({
    accessToken: generateAccessToken(
      userCredentials._id,
      userCredentials.userInfoId,
    ),
    refreshToken: generateRefreshToken(
      userCredentials._id,
      userCredentials.userInfoId,
    ),
  });
});

authRouter.post("/token", async (req, res) => {
  const refreshToken: string = req.cookies.refreshToken;

  try {
    const { userCredentialsId, userInfoId } = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET as string,
    ) as jwt.JwtPayload;

    res
      .status(200)
      .json({
        accessToken: generateRefreshToken(userCredentialsId, userInfoId),
      });
  } catch (error) {
    if (error instanceof mongooseError) {
      res.status(401).json({ message: error.message });
    }
  }
});

export default authRouter;

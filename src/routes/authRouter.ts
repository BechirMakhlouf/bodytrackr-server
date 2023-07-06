import env from "dotenv";
env.config();
import { Router } from "express";
import mongoose, { Error, mongo } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import UserCredentials from "../models/userModel.js";
import UserInfo from "../models/userInfoModel.js";

const authRouter = Router();

const areCredentialsValid = (userCredentials: { email:string, password: string}): boolean => {
  return Boolean(userCredentials.password) && Boolean(userCredentials.email);
};

const generateAccessToken = (email: string, userInfoId: mongoose.Types.ObjectId): string => {
  return jwt.sign({ email: email, userInfoId: userInfoId }, process.env.SECRET as string, {
    expiresIn: "5m",
  });
};

const generateRefreshToken = (email: string, userInfoId: mongoose.Types.ObjectId): string => {
  return jwt.sign({ email: email }, process.env.REFRESH_SECRET as string, {
    expiresIn: "15m",
  });
};

authRouter.post("/login", async (req, res) => {
  const userCredentialsSent = {
    email: req.body.email,
    password: req.body.password,
  };

  if (!areCredentialsValid(userCredentialsSent)) {
    return res.status(401).json({ message: "credentials are invalid!" });
  }

  await mongoose.connect(process.env.MONGODB_URI as string);

  const user = await UserCredentials.findOne({
    email: userCredentialsSent.email,
  });

  if (!user) {
    return res.status(401).json({ message: "invalid email or password" });
  }

  const isPasswordCorrect = await bcrypt.compare(
    userCredentialsSent.password,
    user.password
  );

  if (!isPasswordCorrect) {
    return res.status(401).json({ message: "invalid email or password" });
  }

  return res.status(200).json({
    accessToken: generateAccessToken(userCredentialsSent.email),
    refreshToken: generateRefreshToken(userCredentialsSent.email),
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

  await mongoose.connect(process.env.MONGODB_URI as string);

  try {
    const userInfo = new UserInfo({
      sex: "other",
      weightLog: [],
    })

    const userCredentials = new UserCredentials({
      email: userCredentialsSent.email,
      password: await bcrypt.hash(userCredentialsSent.password, 10),
      userInfoId: userInfo._id,
    });
    
    await userCredentials.save();
    await userInfo.save();
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
    return;
  }

  return res.status(200).json({
    accessToken: generateAccessToken(userCredentialsSent.email),
    refreshToken: generateRefreshToken(userCredentialsSent.email),
  });
});

authRouter.post("/token", async (req, res) => {
  const refreshToken: string = req.body.refreshToken;

  try {
    const { email } = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET as string
    ) as jwt.JwtPayload;

    res.status(200).json({ accessToken: generateRefreshToken(email) });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: error.message });
      return;
    }
  }
});

export default authRouter;

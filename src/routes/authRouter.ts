import env from "dotenv";
env.config();
import { Router } from "express";
import mongoose, { Error } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import UserCredentials from "../models/userModel.js";
import UserInfo from "../models/userInfoModel.js";

const authRouter = Router();

const areCredentialsValid = (userCredentials: {
  email: string;
  password: string;
}): boolean => {
  return Boolean(userCredentials.password) && Boolean(userCredentials.email);
};

const generateAccessToken = (
  userCredentialsId: mongoose.Types.ObjectId,
  userInfoId: mongoose.Types.ObjectId,
): string => {
  return jwt.sign(
    { userCredentialsId: userCredentialsId, userInfoId: userInfoId },
    process.env.SECRET as string,
    {
      expiresIn: "15m",
    },
  );
};

const generateRefreshToken = (
  userCredentialsId: mongoose.Types.ObjectId,
  userInfoId: mongoose.Types.ObjectId,
): string => {
  return jwt.sign(
    { userCredentialsId: userCredentialsId, userInfoId: userInfoId },
    process.env.REFRESH_SECRET as string,
    {
      expiresIn: "15 days",
    },
  );
};

const expiresInDays = (numberOfDays: number): Date => {
  const cookieExpirationDate = new Date();
  cookieExpirationDate.setDate(cookieExpirationDate.getDate() + numberOfDays);

  return cookieExpirationDate;
};

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

  await mongoose.connect(process.env.MONGODB_URI as string);

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

  // res.cookie(
  //   "refreshToken",
  //   generateRefreshToken(
  //     userCredentials._id,
  //     userCredentials.userInfoId,
  //   ),
  //   {
  //     expires: expiresInDays(10),
  //     httpOnly: true,
  //     secure: true,
  //   },
  // );

  // we are sending the cookie in the response body temporarily be aware! CHANGETHIS!
  res.cookie(
    "refreshToken",
    generateRefreshToken(
      userCredentials._id,
      userCredentials.userInfoId,
    ),
    {
      expires: expiresInDays(10),
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
    // refreshTokenCookie: "refreshTokenCookie=fuck;"
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
    res.status(401).json({ message: (error as Error).message });
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
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    }
  }
});

export default authRouter;

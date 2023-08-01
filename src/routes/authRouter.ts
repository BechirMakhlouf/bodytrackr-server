import env from "dotenv";
env.config();
import { Router } from "express";
import { connect as mongooseConnect, Error as mongooseError } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import UserCredentials from "../models/userCredentialsModel.js";
import { Sex, Unit } from "../models/userInfoModel.js";
import UserInfo from "../models/userInfoModel.js";
import {
  areCredentialsValid,
  expiresInDays,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/authUtils.js";
import { ObjectId } from "mongodb";

const authRouter = Router();

async function verifyCaptchaToken(captchaToken: string): Promise<boolean> {
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${captchaToken}`,
    {
      method: "POST",
    },
  );

  return (await response.json()).success;
}

authRouter.post("/login", async (req, res) => {
  const userCredentialsSent = {
    email: req.body.email,
    password: req.body.password,
  };

  const captchaTokenSent = req.body.captchaToken;

  if (!(await verifyCaptchaToken(captchaTokenSent))) {
    res.status(401).json({
      message: "captcha is invalid",
    });
    return;
  }

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
  });
});

authRouter.post("/register", async (req, res) => {
  const userCredentialsSent = {
    email: req.body.email,
    password: req.body.password,
  };

  const captchaTokenSent = req.body.captchaToken;
  if (!(await verifyCaptchaToken(captchaTokenSent))) {
    res.status(401).json({
      message: "captcha is invalid",
    });
    return;
  }

  if (!areCredentialsValid(userCredentialsSent)) {
    res.status(401).json({ message: "invalid credentials" });
    return;
  }

  await mongooseConnect(process.env.MONGODB_URI as string);

  const userInfo = new UserInfo({
    email: userCredentialsSent.email,
    sex: Sex.Other,
    weightLog: [],
    name: "",
    firstName: "",
    heightCm: 0,
    birthYear: 0,
    goalWeight: 0,
    preferences: {
      darkMode: false,
      lengthUnit: Unit.Metric,
      weightUnit: Unit.Metric,
    },
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
  });
});

authRouter.post("/oauth/google", async (req, res) => {
  const googleOauthCredentials: {
    clientId: string;
    credential: string;
    select_by: string;
  } = req.body;

  const credentialResponse: any = jwt.decode(googleOauthCredentials.credential);
  req.body.email = credentialResponse.email;
  req.body.password = credentialResponse.sub;

  const userCredentialsSent = {
    email: credentialResponse.email,
    password: credentialResponse.sub,
  };

  const userCredentialsId: { _id: ObjectId } | null = await UserCredentials
    .exists({
      email: credentialResponse.email,
    });

  try {
    if (userCredentialsId) {
      const userCredentials = await UserCredentials.findById(userCredentialsId);

      bcrypt.compare(
        userCredentialsSent.password,
        userCredentials?.password as string,
      );

      if (!areCredentialsValid(userCredentialsSent)) {
        return res.status(401).json({ message: "credentials are invalid!" });
      }

      await mongooseConnect(process.env.MONGODB_URI as string);

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
      });
    }
    await mongooseConnect(process.env.MONGODB_URI as string);

    const userInfo = new UserInfo({
      email: userCredentialsSent.email,
      sex: Sex.Other,
      weightLog: [],
      name: "",
      firstName: "",
      heightCm: 0,
      birthYear: 0,
      goalWeight: 0,
      preferences: {
        darkMode: false,
        lengthUnit: Unit.Metric,
        weightUnit: Unit.Metric,
      },
    });

    const userCredentials = new UserCredentials({
      email: userCredentialsSent.email,
      password: await bcrypt.hash(userCredentialsSent.password, 10),
      userInfoId: userInfo._id,
    });
    await userCredentials.save();
    await userInfo.save();

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
    });
  } catch (e) {
    res.status(400).json(
      {
        message: (e as Error).message,
      },
    );
  }
});

authRouter.get("/token", async (req, res, next) => {
  const refreshToken: string = req.signedCookies.refreshToken;

  if (!refreshToken) {
    res.status(401);
    next(new Error("No refresh token provided."));
    return;
  }

  try {
    const { userCredentialsId, userInfoId } = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET as string,
    ) as jwt.JwtPayload;

    res
      .status(200)
      .json({
        accessToken: generateAccessToken(userCredentialsId, userInfoId),
      });
  } catch (e) {
    res.status(401).clearCookie("refreshToken");
    next(new Error((e as Error).message));
  }
});

export default authRouter;

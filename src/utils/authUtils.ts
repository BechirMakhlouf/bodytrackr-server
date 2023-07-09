import env from "dotenv";
env.config();
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";


const areCredentialsValid = (userCredentials: {
  email: string;
  password: string;
}): boolean => {
  return Boolean(userCredentials.password) && Boolean(userCredentials.email);
};

const generateAccessToken = (
  userCredentialsId: ObjectId,
  userInfoId: ObjectId,
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
  userCredentialsId: ObjectId,
  userInfoId: ObjectId,
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

export {
  areCredentialsValid,
  generateAccessToken,
  generateRefreshToken,
  expiresInDays,
}

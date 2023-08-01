import env from "dotenv";
env.config();
import mongoose from "mongoose";

interface IUserCredentials {
  email: string;
  password: string;
  userInfoId: mongoose.Types.ObjectId;
}

export interface IUserCredentialswithCaptcha extends IUserCredentials {
  captchaToken: string;
}

const userCredentialsSchema = new mongoose.Schema<IUserCredentials>({
  email: {
    type: String,
    required: true,
    unique: true,
    min: 1,
    max: 320,
  },
  password: {
    type: String,
    required: true,
    min: 8,
    max: 1024,
  },
  userInfoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserInfo",
    // default: "0",
  },
});

const UserCredentials = mongoose.model<IUserCredentials>(
  "UserCredentials",
  userCredentialsSchema,
);

export default UserCredentials;

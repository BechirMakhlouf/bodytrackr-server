import mongoose from "mongoose";

export enum Unit {
  Metric = "metric",
  Imperial = "imperial",
}

export enum Sex {
  Male = "male",
  Female = "female",
  Other = "other",
}

interface Weight {
  weightKg: number;
  date: Date;
}

interface IUserInfo {
  name?: string;
  firstName?: string;
  email: string;
  sex?: "male" | "female" | "other";
  heightCm?: number;
  birthYear?: number;
  preferences?: {
    weightUnit?: "metric" | "imperial";
    lengthUnit?: "metric" | "imperial";
    darkMode?: boolean;
  };
  weightLog: Weight[];
}

const userInfoSchema = new mongoose.Schema<IUserInfo>({
  name: {
    type: String,
    default: "",
  },
  firstName: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
  },
  sex: {
    type: String,
    enum: Object.values(Sex),
    default: Sex.Other,
  },
  heightCm: {
    type: Number,
  },
  birthYear: {
    type: Number,
  },
  preferences: {
    weightUnit: {
      type: String,
      enum: Object.values(Unit),
      default: "metric",
    },
    lengthUnit: {
      type: String,
      enum: Object.values(Unit),
      default: "metric",
    },
    darkMode: {
      type: Boolean,
      default: false,
    },
  },
  weightLog: {
    type: [{ weightKg: String, date: { type: Date, unique: true } }],
    required: true,
  },
});

const UserInfo = mongoose.model("UserInfo", userInfoSchema);

export default UserInfo;
export { IUserInfo, Weight };

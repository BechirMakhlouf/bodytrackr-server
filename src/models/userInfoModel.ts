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

export interface IUserPreferences {
  weightUnit?: Unit;
  lengthUnit?: Unit;
  darkMode?: boolean;
}

interface IUserInfo {
  name?: string;
  firstName?: string;
  email: string;
  sex?: Sex;
  heightCm?: number;
  birthYear?: number;
  goalWeight?: number;
  preferences: IUserPreferences;
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
  goalWeight: {
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
    type: [{ weightKg: String, date: { type: Date } }],
    required: true,
  },
});

const UserInfo = mongoose.model("UserInfo", userInfoSchema);

export default UserInfo;
export { IUserInfo, Weight };

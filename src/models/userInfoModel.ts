import mongoose from "mongoose";

interface Weight {
  weightKg: number;
  date: Date;
}

// remove I from name
interface IUserInfo {
  name?: string;
  firstName?: string;
  email: string;
  sex?: "male" | "female" | "other";
  heightCm?: number;
  birthYear?: number;
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
    required: true,
  },
  heightCm: {
    type: Number,
  },
  birthYear: {
    type: Number,
  },
  weightLog: {
    type: [{ weightKg: String, date: { type: Date, unique: true } }],
    required: true,
  },
});

const UserInfo = mongoose.model("UserInfo", userInfoSchema);

export default UserInfo;
export { Weight };

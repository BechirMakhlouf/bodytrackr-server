import mongoose from "mongoose";

interface Weight {
  weightKg: number;
  date: Date;
}

// remove I from name
interface IUserInfo {
  sex?: "male" | "female" | "other";
  heightCm?: number;
  birthYear?: number;
  weightLog: Weight[];
}

const userInfoSchema = new mongoose.Schema<IUserInfo>({
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
    type: [{ weightKg: String, date: Date }],
    required: true,
  },
});

const UserInfo = mongoose.model("UserInfo", userInfoSchema);

export default UserInfo;

import mongoose from "mongoose";

interface Weight {
  weightKg: number;
  date: Date;
}

interface UserInfo {
  sex?: "male" | "female" | "other";
  weightLog: Weight[];
}

const userInfoSchema = new mongoose.Schema<UserInfo>({
  sex: {
    type: String,
    required: true,
  },
  weightLog: {
    type: [{ weightKg: String, date: Date }],
    required: true,
  },
});

const UserInfo = mongoose.model("UserInfo", userInfoSchema);

export default userInfoSchema;
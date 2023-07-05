import env from "dotenv";
env.config();
import mongoose from "mongoose";


interface UserCredentials {
  email: string;
  password: string;
}

const userCredentialsSchema = new mongoose.Schema<UserCredentials>({
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
});

const UserCredentials = mongoose.model<UserCredentials>("user", userCredentialsSchema);

export default UserCredentials;

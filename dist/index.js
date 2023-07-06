import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import UserInfo from "./src/models/userInfoModel.js";
import authRouter from "./src/routes/authRouter.js";
const PORT = Number(process.env.PORT) || 6969;
const app = express();
app.use(express.json());
app.use((req, res, next) => {
    if (req.headers["authorization"] && req.url !== "/token") {
        jwt.verify(req.headers["authorization"].split(" ")[1], process.env.SECRET);
        next();
        return;
    }
    next();
});
app.use("/", authRouter);
app.post("/userinfo", async (req, res) => {
    await mongoose.connect(process.env.MONGODB_URI);
    const myUserInfo = new UserInfo({
        sex: req.body.sex,
        weightLog: req.body.weightLog,
    });
    await myUserInfo.save();
    res.json({ message: "success~~!" });
});
app.use((error, req, res, next) => {
    req;
    res;
    next;
    res.json({ message: error.message });
});
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

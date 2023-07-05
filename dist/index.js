import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import authRouter from "./src/routes/authRouter.js";
const PORT = Number(process.env.PORT) || 6969;
const app = express();
app.use(express.json());
app.use((req, res, next) => {
    if (req.headers["authorization"] && req.url !== "/token") {
        jwt.verify(req.headers["authorization"].split(' ')[1], process.env.SECRET);
        console.log(req.headers["authorization"]);
        next();
        return;
    }
    next();
});
app.use("/", authRouter);
app.use((error, req, res, next) => {
    res.json({ message: error.message });
});
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

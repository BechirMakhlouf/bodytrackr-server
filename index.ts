import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser, { signedCookie } from "cookie-parser";
import cors from "cors";
import authRouter from "./src/routes/authRouter.js";
import userInfoRouter from "./src/routes/userInfoRouter.js";

const PORT = Number(process.env.PORT) || 6969;
const app = express();

app.use(cors());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());

app.use((req, res, next) => {
  if (req.headers["authorization"] && req.url !== "/token") {
    const userIds: any = jwt.verify(
      req.headers["authorization"].split(" ")[1],
      process.env.SECRET as string,
    );
    req.body.userCredentialsId = userIds.userCredentialsId;
    req.body.userInfoId = userIds.userInfoId;

    next();
    return;
  }
  console.log(req.signedCookies);

  next();
});

app.use("/", authRouter);
app.use("/", userInfoRouter);

app.use((error: Error, req: any, res: any, next: any) => {
  req;
  res;
  next;
  res.json({ message: error.message });
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

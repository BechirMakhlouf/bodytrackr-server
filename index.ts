import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./src/routes/authRouter.js";
import userInfoRouter from "./src/routes/userInfoRouter.js";

const PORT = Number(process.env.PORT) || 6969;
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

function tokenVerificationMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (req.headers["authorization"] && req.url !== "/token") {
    const userIds: any = jwt.verify(
      req.headers["authorization"].split(" ")[1],
      process.env.SECRET as string,
    );

    req.body.userCredentialsId = userIds.userCredentialsId;
    req.body.userInfoId = userIds.userInfoId;

    next();
    return;
  } else {
    res.status(401);
    next(new Error("Acess Token Required"));
  }

  next();
}

app.use("/", authRouter);
app.use("/", tokenVerificationMiddleware, userInfoRouter);

app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    res.json({ message: error.message });
  },
);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

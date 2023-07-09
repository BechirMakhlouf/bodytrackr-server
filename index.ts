import { config as dotEnvConfig } from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
dotEnvConfig();

import authRouter from "./src/routes/authRouter.js";
import userInfoRouter from "./src/routes/userInfoRouter.js";
import tokenVerificationMiddleware from "./src/middlewares/tokenVerificationMiddleware.js";
import errorHandlingMiddleware from "./src/middlewares/errorHandlingMiddlware.js";

const PORT = Number(process.env.PORT) || 6969;
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", tokenVerificationMiddleware, userInfoRouter);
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

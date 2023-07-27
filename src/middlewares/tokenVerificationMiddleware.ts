import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default function tokenHandlerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.headers["authorization"]) {
    res.status(401);
    next(new Error("Access Token Required"));
    return;
  }

  try {
    const userIds = jwt.verify(
      req.headers["authorization"].split(" ")[1],
      process.env.SECRET as string,
    ) as {
      userCredentialsId: string;
      userInfoId: string;
    };

    req.body.userCredentialsId = userIds.userCredentialsId;
    req.body.userInfoId = userIds.userInfoId;
  } catch (e) {
    res.status(401);
    next(new Error("invalid jwt token"));
  }

  next();
}

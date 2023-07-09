import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default function tokenHandlerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.headers["authorization"]) {
    res.status(401);
    next(new Error("Acess Token Required"));
    return;
  }

  const userIds: any = jwt.verify(
    req.headers["authorization"].split(" ")[1],
    process.env.SECRET as string,
  );

  req.body.userCredentialsId = userIds.userCredentialsId;
  req.body.userInfoId = userIds.userInfoId;

  next();
}

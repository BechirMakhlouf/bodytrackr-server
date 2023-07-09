import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"

export default function tokenVerificationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
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

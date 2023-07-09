import { NextFunction, Request, Response } from "express";

export default function errorHandlingMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.json({ message: error.message });
}

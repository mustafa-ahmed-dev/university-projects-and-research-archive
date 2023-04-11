import { Request, Response, NextFunction } from "express";

import asyncHandler from "./../helpers/asyncHandler.helper";
import UnauthorizedError from "./../errors/UnauthorizedError";
import { verifyToken } from "./../helpers/jwt.helper";

const authMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return next(new UnauthorizedError("No token were provided"));

  const [payload, error] = <[any, any]>await asyncHandler(verifyToken(token));

  if (error) {
    next(error);
    return;
  }

  next();
};

export default authMiddleware;

import HttpError from "./../errors/HttpError";
import { Request, Response, NextFunction } from "express";

const notFoundMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  response.status(404).json({
    success: false,
    isExistingRoute: false,
    message: "Invalid route",
  });
};

export default notFoundMiddleware;

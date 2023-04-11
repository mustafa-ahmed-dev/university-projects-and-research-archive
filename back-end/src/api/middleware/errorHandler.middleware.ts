import { NextFunction, Request, Response } from "express";
import logger from "./../helpers/logger.helper";
import { PrismaClientUnknownRequestError } from "@prisma/client/runtime";

function errorMiddleware(
  error: any,
  request: Request,
  response: Response,
  next: NextFunction
) {
  const status = error?.status || 500;
  const message = error.message || "Something went wrong";

  logger.log("error", {
    path: request.path,
    method: request.method,
    token: request.headers.authorization?.split(" ")[1],
    message,
    status,
  });

  response.status(status).send({
    message,
    status,
  });
}

export default errorMiddleware;

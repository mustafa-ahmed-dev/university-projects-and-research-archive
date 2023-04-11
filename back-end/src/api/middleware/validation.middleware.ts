import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

import BadRequestError from "./../errors/BadRequestError";

const validationMiddleware =
  (schema: AnyZodObject) =>
  (request: Request, response: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: request.body,
        query: request.query,
        params: request.params,
      });
      next();
    } catch (e: any) {
      next(new BadRequestError(e.errors));
    }
  };

export default validationMiddleware;

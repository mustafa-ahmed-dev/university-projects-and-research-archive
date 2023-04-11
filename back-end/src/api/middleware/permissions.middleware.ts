import { Request, Response, NextFunction } from "express";
import {
  PrismaClient,
  PermissionType,
  DocType,
  Permission,
  User,
} from "@prisma/client";

import asyncHandler from "./../helpers/asyncHandler.helper";
import { decodeToken, JWTPayload } from "./../helpers/jwt.helper";
// import UnauthorizedError from "./../errors/UnauthorizedError";
import ForbiddenError from "./../errors/ForbiddenError";

const permissionsMiddleware =
  (prisma: PrismaClient, permissionType: PermissionType, docType: DocType) =>
  async (request: Request, response: Response, next: NextFunction) => {
    const token = String(request.headers.authorization?.split(" ")[1]);

    let [{ username }, error] = <[JWTPayload, any]>(
      await asyncHandler(decodeToken(token))
    );

    if (error) return next(error);

    let user: User | null;
    [user, error] = <[User | null, any]>await asyncHandler(
      prisma.user.findUnique({
        where: { username },
        include: { Permissions: true },
      })
    );

    if (error) return next(error);

    if (!user) return next(new ForbiddenError());

    let permission: Permission;
    [permission, error] = <[Permission, any]>await asyncHandler(
      prisma.permission.findFirst({
        where: { userId: user.id, docType, permissionType },
      })
    );

    if (!permission) return next(new ForbiddenError());

    next();
  };

export default permissionsMiddleware;

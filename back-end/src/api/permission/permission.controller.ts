import {
  Permission,
  PrismaClient,
  DocType,
  PermissionType,
  User,
} from "@prisma/client";
import { Router, Request, Response, NextFunction } from "express";

import Controller from "./../abstracts/Controller";
import PermissionService from "./permission.service";
import validationMiddleware from "./../middleware/validation.middleware";
import {
  Id,
  IdSchema,
  ManyPermissionData,
  ManyPermissionSchema,
  PermissionData,
  PermissionSchema,
} from "./permission.validation";
import asyncHandler from "../helpers/asyncHandler.helper";
import NotFoundError from "./../errors/NotFoundError";
import permissionsMiddleware from "./../middleware/permissions.middleware";
import authMiddleware from "./../middleware/auth.middleware";
import logger from "./../helpers/logger.helper";

class PermissionController extends Controller {
  public routes = {
    getAll: "",
    getOne: "/:id",
    createOne: "",
    createMany: "/many",
    updateOne: "/:id",
    deleteOne: "/:id",
  };
  public router: Router;

  private service: PermissionService;
  private prisma: PrismaClient;

  constructor() {
    super("/permissions", DocType.PERMISSION);

    this.router = Router();
    this.prisma = new PrismaClient();
    this.service = new PermissionService(this.prisma, this.docType);

    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(
      this.routes.getAll,
      authMiddleware,
      permissionsMiddleware(this.prisma, PermissionType.READ, this.docType),
      this.getAll_route
    );

    this.router.get(
      this.routes.getOne,
      authMiddleware,
      permissionsMiddleware(this.prisma, PermissionType.READ, this.docType),
      validationMiddleware(IdSchema),
      this.getOne_route
    );

    this.router.post(
      this.routes.createOne,
      authMiddleware,
      permissionsMiddleware(this.prisma, PermissionType.CREATE, this.docType),
      validationMiddleware(PermissionSchema),
      this.createOne_route
    );

    this.router.post(
      this.routes.createMany,
      authMiddleware,
      permissionsMiddleware(this.prisma, PermissionType.CREATE, this.docType),
      validationMiddleware(ManyPermissionSchema),
      this.createMany_route
    );

    this.router.delete(
      this.routes.deleteOne,
      authMiddleware,
      permissionsMiddleware(this.prisma, PermissionType.DELETE, this.docType),
      validationMiddleware(IdSchema),
      this.deleteOne_route
    );

    this.router.put(
      this.routes.updateOne,
      authMiddleware,
      permissionsMiddleware(this.prisma, PermissionType.UPDATE, this.docType),
      validationMiddleware(PermissionSchema),
      this.updateOne_route
    );
  }

  /**
   * @desc        Gets all permissions
   * @method      GET
   * @path        /permissions
   * @access      public
   */
  private getAll_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const [permissions, error] = <[Permission[], any]>(
      await asyncHandler(this.service.findAll())
    );

    if (error) return next(error);

    response.json({
      success: true,
      permissions,
    });
  };

  /**
   * @desc        Gets one permission by id
   * @method      GET
   * @path        /permissions
   * @access      public
   */
  private getOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    const [permission, error] = <[Permission, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!permission)
      return next(
        new NotFoundError(`There is no such a permission with the id of ${id}`)
      );

    response.json({
      success: true,
      permission,
    });
  };

  /**
   * @desc        Creates one permission
   * @method      POST
   * @path        /permissions
   * @access      public
   */
  private createOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const data = <PermissionData>request.body;

    let [permission, error] = <[Permission, any]>(
      await asyncHandler(this.service.createOne(data))
    );

    if (error) return next(error);

    response.status(201).json({
      success: true,
      permission,
    });
  };

  /**
   * @desc        Creates one permission
   * @method      POST
   * @path        /permissions/many
   * @access      public
   */
  private createMany_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const data = <ManyPermissionData>request.body;

    let [user, error] = <[User, any]>(
      await asyncHandler(
        this.prisma.user.findUnique({ where: { id: data[0].userId } })
      )
    );

    if (error) next(error);

    if (!user)
      return next(
        new NotFoundError(`User with the id of ${data[0].userId} is not found!`)
      );

    let permissions: Permission[];
    [permissions, error] = <[Permission[], any]>(
      await asyncHandler(this.service.createMany(data))
    );

    if (error) return next(error);

    response.status(201).json({
      success: true,
      permissions,
    });
  };

  private deleteOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    let [permission, error] = <[Permission, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!permission)
      return next(
        new NotFoundError(`There is no such a permission with the id of ${id}`)
      );

    [permission, error] = <[Permission, any]>(
      await asyncHandler(this.service.deleteOne(id))
    );

    if (error) return next(error);

    response.json({ success: true, permission });
  };

  private updateOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    let [permission, error] = <[Permission, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!permission)
      return next(
        new NotFoundError(`There is no such a permission with the id of ${id}`)
      );

    const data = <PermissionData>request.body;

    [permission, error] = <[Permission, any]>(
      await asyncHandler(this.service.updateOne(id, data))
    );

    if (error) return next(error);

    response.json({
      permission,
      success: true,
    });
  };
}

export default PermissionController;

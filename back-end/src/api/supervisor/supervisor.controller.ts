import {
  Supervisor,
  PrismaClient,
  DocType,
  PermissionType,
} from "@prisma/client";
import { Router, Request, Response, NextFunction } from "express";

import Controller from "../abstracts/Controller";
import SupervisorService from "./supervisor.service";
import validationMiddleware from "../middleware/validation.middleware";
import {
  SupervisorSchema,
  Id,
  SupervisorData,
  IdSchema,
  ManySupervisorSchema,
  ManySupervisorData,
} from "./supervisor.validation";
import asyncHandler from "../helpers/asyncHandler.helper";
import NotFoundError from "../errors/NotFoundError";
import ConflictError from "../errors/ConflictError";
import authMiddleware from "../middleware/auth.middleware";
import permissionsMiddleware from "../middleware/permissions.middleware";

class SupervisorController extends Controller {
  public routes = {
    getAll: "",
    getOne: "/:id",
    createOne: "",
    createMany: "/many",
    updateOne: "/:id",
    deleteOne: "/:id",
  };
  public router: Router;

  private service: SupervisorService;
  private prisma: PrismaClient;

  constructor() {
    super("/supervisors", DocType.SUPERVISOR);

    this.router = Router();
    this.prisma = new PrismaClient();
    this.service = new SupervisorService(this.prisma, this.docType);

    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.routes.getAll, this.getAll_route);

    this.router.get(
      this.routes.getOne,
      validationMiddleware(IdSchema),
      this.getOne_route
    );

    this.router.post(
      this.routes.createOne,
      authMiddleware,
      permissionsMiddleware(this.prisma, PermissionType.CREATE, this.docType),
      validationMiddleware(SupervisorSchema),
      this.createOne_route
    );

    this.router.post(
      this.routes.createMany,
      authMiddleware,
      permissionsMiddleware(this.prisma, PermissionType.CREATE, this.docType),
      validationMiddleware(ManySupervisorSchema),
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
      validationMiddleware(SupervisorSchema),
      this.updateOne_route
    );
  }

  /**
   * @desc        Gets all supervisors
   * @method      GET
   * @path        /supervisors
   * @access      public
   */
  private getAll_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const [supervisors, error] = <[Supervisor[], any]>(
      await asyncHandler(this.service.findAll())
    );

    if (error) return next(error);

    response.json({
      success: true,
      supervisors,
    });
  };

  /**
   * @desc        Gets one supervisor by id
   * @method      GET
   * @path        /supervisors
   * @access      public
   */
  private getOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    const [supervisor, error] = <[Supervisor, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!supervisor) {
      next(
        new NotFoundError(`There is no such a supervisor with the id of ${id}`)
      );
      return;
    }

    response.json({
      success: true,
      supervisor,
    });
  };

  /**
   * @desc        Creates one supervisor
   * @method      POST
   * @path        /supervisors
   * @access      public
   */
  private createOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const data = <SupervisorData>request.body;

    const [supervisor, error] = <[Supervisor, any]>(
      await asyncHandler(this.service.createOne(data))
    );

    if (error) return next(error);

    response.status(201).json({
      success: true,
      supervisor,
    });
  };

  /**
   * @desc        Creates one supervisor
   * @method      POST
   * @path        /supervisors/many
   * @access      public
   */
  private createMany_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const data = <ManySupervisorData>request.body;

    const [supervisors, error] = <[Supervisor, any]>(
      await asyncHandler(this.service.createMany(data))
    );

    if (error) return next(error);

    response.status(201).json({
      success: true,
      supervisor: supervisors,
    });
  };

  /**
   * @desc        Creates one supervisor
   * @method      DELETE
   * @path        /supervisors/:id
   * @access      public
   */
  private deleteOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    let [supervisor, error] = <[Supervisor, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!supervisor)
      return next(
        new NotFoundError(`There is no such a supervisor with the id of ${id}`)
      );

    [supervisor, error] = <[Supervisor, any]>(
      await asyncHandler(this.service.deleteOne(id))
    );

    if (error) return next(error);

    response.json({ success: true, supervisor });
  };

  /**
   * @desc        Creates one supervisor
   * @method      PUT
   * @path        /supervisors/:id
   * @access      public
   */
  private updateOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    let [supervisor, error] = <[Supervisor, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!supervisor)
      return next(
        new NotFoundError(`There is no such a supervisor with the id of ${id}`)
      );

    const data = <SupervisorData>request.body;

    [supervisor, error] = <[Supervisor, any]>(
      await asyncHandler(this.service.updateOne(id, data))
    );

    if (error) return next(error);

    response.json({
      supervisor,
      success: true,
    });
  };
}

export default SupervisorController;

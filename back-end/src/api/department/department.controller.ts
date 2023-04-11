import {
  Department,
  PrismaClient,
  DocType,
  PermissionType,
} from "@prisma/client";
import { Router, Request, Response, NextFunction } from "express";

import Controller from "../abstracts/Controller";
import DepartmentService from "./department.service";
import validationMiddleware from "../middleware/validation.middleware";
import {
  DepartmentSchema,
  Id,
  DepartmentData,
  IdSchema,
} from "./department.validation";
import asyncHandler from "../helpers/asyncHandler.helper";
import NotFoundError from "../errors/NotFoundError";
import ConflictError from "../errors/ConflictError";
import authMiddleware from "./../middleware/auth.middleware";
import permissionsMiddleware from "./../middleware/permissions.middleware";

class DepartmentController extends Controller {
  public routes = {
    getAll: "",
    getOne: "/:id",
    createOne: "",
    updateOne: "/:id",
    deleteOne: "/:id",
  };
  public router: Router;

  private service: DepartmentService;
  private prisma: PrismaClient;

  constructor() {
    super("/departments", DocType.DEPARTMENT);

    this.router = Router();
    this.prisma = new PrismaClient();
    this.service = new DepartmentService(this.prisma, this.docType);

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
      validationMiddleware(DepartmentSchema),
      this.createOne_route
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
      validationMiddleware(DepartmentSchema),
      this.updateOne_route
    );
  }

  /**
   * @desc        Gets all departments
   * @method      GET
   * @path        /departments
   * @access      public
   */
  private getAll_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const [departments, error] = <[Department[], any]>(
      await asyncHandler(this.service.findAll())
    );

    if (error) return next(error);

    response.json({
      success: true,
      departments,
    });
  };

  /**
   * @desc        Gets one department by id
   * @method      GET
   * @path        /departments
   * @access      public
   */
  private getOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    const [department, error] = <[Department, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!department)
      return next(
        new NotFoundError(`There is no such a department with the id of ${id}`)
      );

    response.json({
      success: true,
      department,
    });
  };

  /**
   * @desc        Creates one department
   * @method      POST
   * @path        /departments
   * @access      public
   */
  private createOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { name, collegeId } = <DepartmentData>request.body;

    let [department, error] = <[Department, any]>(
      await asyncHandler(this.service.findOneByName(collegeId, name))
    );

    if (error) return next(error);

    if (department)
      return next(
        new ConflictError(`A department with the name "${name}" already exists`)
      );

    [department, error] = <[Department, any]>(
      await asyncHandler(this.service.createOne({ name, collegeId }))
    );

    if (error) return next(error);

    response.status(201).json({
      success: true,
      department,
    });
  };

  private deleteOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    let [department, error] = <[Department, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!department)
      return next(
        new NotFoundError(`There is no such a department with the id of ${id}`)
      );

    [department, error] = <[Department, any]>(
      await asyncHandler(this.service.deleteOne(id))
    );

    if (error) return next(error);

    response.json({ success: true, department });
  };

  private updateOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;
    const { name, collegeId } = <DepartmentData>request.body;

    let [department, error] = <[Department, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!department)
      return next(
        new NotFoundError(`There is no such a department with the id of ${id}`)
      );

    [department, error] = <[Department, any]>(
      await asyncHandler(this.service.updateOne(id, { name, collegeId }))
    );

    if (error) return next(error);

    response.json({
      department,
      success: true,
    });
  };
}

export default DepartmentController;

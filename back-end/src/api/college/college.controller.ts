import { College, PrismaClient, DocType, PermissionType } from "@prisma/client";
import { Router, Request, Response, NextFunction } from "express";

import Controller from "./../abstracts/Controller";
import CollegeService from "./college.service";
import validationMiddleware from "./../middleware/validation.middleware";
import { CollegeSchema, Id, CollegeData, IdSchema } from "./college.validation";
import asyncHandler from "../helpers/asyncHandler.helper";
import NotFoundError from "./../errors/NotFoundError";
import ConflictError from "./../errors/ConflictError";
import authMiddleware from "./../middleware/auth.middleware";
import permissionsMiddleware from "./../middleware/permissions.middleware";

class CollegeController extends Controller {
  public routes = {
    getAll: "",
    getOne: "/:id",
    createOne: "",
    updateOne: "/:id",
    deleteOne: "/:id",
  };
  public router: Router;

  private service: CollegeService;
  private prisma: PrismaClient;

  constructor() {
    super("/colleges", DocType.COLLEGE);

    this.router = Router();
    this.prisma = new PrismaClient();
    this.service = new CollegeService(this.prisma, this.docType);

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
      validationMiddleware(CollegeSchema),
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
      validationMiddleware(CollegeSchema),
      this.updateOne_route
    );
  }

  /**
   * @desc        Gets all colleges
   * @method      GET
   * @path        /colleges
   * @access      public
   */
  private getAll_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const [colleges, error] = <[College[], any]>(
      await asyncHandler(this.service.findAll())
    );

    if (error) return next(error);

    response.json({
      success: true,
      colleges,
    });
  };

  /**
   * @desc        Gets one college by id
   * @method      GET
   * @path        /colleges
   * @access      public
   */
  private getOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    const [college, error] = <[College, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!college) {
      next(
        new NotFoundError(`There is no such a college with the id of ${id}`)
      );
      return;
    }

    response.json({
      success: true,
      college,
    });
  };

  /**
   * @desc        Creates one college
   * @method      POST
   * @path        /colleges
   * @access      public
   */
  private createOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { name } = <CollegeData>request.body;

    let [college, error] = <[College, any]>(
      await asyncHandler(this.service.findOneByName(name))
    );

    if (error) return next(error);

    if (college)
      return next(
        new ConflictError(`A college with the name "${name}" already exists`)
      );

    [college, error] = <[College, any]>(
      await asyncHandler(this.service.createOne({ name }))
    );

    if (error) return next(error);

    response.status(201).json({
      success: true,
      college,
    });
  };

  /**
   * @desc        Creates one college
   * @method      DELETE
   * @path        /colleges/:id
   * @access      public
   */
  private deleteOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    let [college, error] = <[College, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!college)
      return next(
        new NotFoundError(`There is no such a college with the id of ${id}`)
      );

    [college, error] = <[College, any]>(
      await asyncHandler(this.service.deleteOne(id))
    );

    if (error) return next(error);

    response.json({ success: true, college });
  };

  /**
   * @desc        Creates one college
   * @method      PUT
   * @path        /colleges/:id
   * @access      public
   */
  private updateOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    let [college, error] = <[College, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!college)
      return next(
        new NotFoundError(`There is no such a college with the id of ${id}`)
      );

    const { name } = <CollegeData>request.body;

    [college, error] = <[College, any]>(
      await asyncHandler(this.service.updateOne(id, { name }))
    );

    if (error) return next(error);

    response.json({
      college,
      success: true,
    });
  };
}

export default CollegeController;

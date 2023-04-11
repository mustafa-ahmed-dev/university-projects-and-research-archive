import { Project, PrismaClient, DocType, PermissionType } from "@prisma/client";
import { Router, Request, Response, NextFunction, Express } from "express";
import multer from "multer";
import path from "path";

import Controller from "../abstracts/Controller";
import ProjectService from "./project.service";
import validationMiddleware from "../middleware/validation.middleware";
import {
  ProjectSchema,
  Id,
  ProjectData,
  IdSchema,
  FiltersData,
  FiltersSchema,
} from "./project.validation";
import asyncHandler from "./../helpers/asyncHandler.helper";
import NotFoundError from "./../errors/NotFoundError";
import ConflictError from "./../errors/ConflictError";
import authMiddleware from "./../middleware/auth.middleware";
import permissionsMiddleware from "../middleware/permissions.middleware";
import logger from "./../helpers/logger.helper";
import BadRequestError from "./../errors/BadRequestError";
import { ObjectData } from "./../helpers/attachment.helper";
import InternalServerError from "./../errors/InternalServerError";

const storage = multer.memoryStorage();
const upload = multer({ storage });

class ProjectController extends Controller {
  public routes = {
    getAll: "",
    getOne: "/:id",
    createOne: "",
    updateOne: "/:id",
    deleteOne: "/:id",
  };
  public router: Router;

  private service: ProjectService;
  private prisma: PrismaClient;

  constructor() {
    super("/projects", DocType.PROJECT);

    this.router = Router();
    this.prisma = new PrismaClient();
    this.service = new ProjectService(this.prisma, this.docType);

    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(
      this.routes.getAll,
      validationMiddleware(FiltersSchema),
      this.getAll_route
    );

    this.router.get(
      this.routes.getOne,
      validationMiddleware(IdSchema),
      this.getOne_route
    );

    this.router.post(
      this.routes.createOne,
      authMiddleware,
      upload.single("document"),
      permissionsMiddleware(this.prisma, PermissionType.CREATE, this.docType),
      validationMiddleware(ProjectSchema),
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
      upload.single("document"),
      permissionsMiddleware(this.prisma, PermissionType.UPDATE, this.docType),
      validationMiddleware(ProjectSchema),
      this.updateOne_route
    );
  }

  /**
   * @desc        Gets all projects
   * @method      GET
   * @path        /projects
   * @access      public
   */
  private getAll_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const filters = <FiltersData>request.query;

    const [projects, error] = <[Project[], any]>(
      await asyncHandler(this.service.findAll(filters))
    );

    if (error) return next(error);

    response.json({
      success: true,
      projects,
    });
  };

  /**
   * @desc        Gets one project by id
   * @method      GET
   * @path        /projects
   * @access      public
   */
  private getOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    let [project, error] = <[Project, any]>(
      await asyncHandler(this.service.findById(id))
    );

    if (error) return next(error);
    if (!project) {
      next(
        new NotFoundError(`There is no such a project with the id of ${id}`)
      );
      return;
    }

    let url: string;
    [url, error] = <[string, any]>(
      await asyncHandler(this.service.getOneFile(project.documentPath))
    );

    response.json({
      success: true,
      project,
      url,
    });
  };

  /**
   * @desc        Creates one project
   * @method      POST
   * @path        /projects
   * @access      public
   */
  private createOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    if (!request.file) return next(new BadRequestError("No file attached"));

    const data = <ProjectData>request.body;
    data.rate = Number(data.rate);
    data.year = Number(data.year);
    data.documentCaption = String(request.file.originalname);

    let [project, error] = <[Project, any]>(
      await asyncHandler(this.service.createOne(data))
    );

    if (error) return next(error);

    const file: ObjectData = {
      fileName: project.documentPath + ".pdf",
      buffer: request.file.buffer,
      mimeType: request.file.mimetype,
    };

    await asyncHandler(this.service.uploadOneFile(file));

    response.status(201).json({ success: true, project });
  };

  /**
   * @desc        Creates one project
   * @method      DELETE
   * @path        /projects/:id
   * @access      public
   */
  private deleteOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    let [project, error] = <[Project, any]>(
      await asyncHandler(this.service.findById(id))
    );

    if (error) return next(error);

    if (!project)
      return next(
        new NotFoundError(`There is no such a project with the id of ${id}`)
      );

    await asyncHandler(this.service.deleteOneFile(project.documentPath));

    response.json({ success: true, project });
  };

  /**
   * @desc        Creates one project
   * @method      PUT
   * @path        /projects/:id
   * @access      public
   */
  private updateOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    let [project, error] = <[Project, any]>(
      await asyncHandler(this.service.findById(id))
    );

    if (error) return next(error);

    if (!project)
      return next(
        new NotFoundError(`There is no such a project with the id of ${id}`)
      );

    const data = <ProjectData>request.body;
    data.rate = Number(data.rate);
    data.year = Number(data.year);

    if (request.file) {
      const file: ObjectData = {
        buffer: request.file.buffer,
        fileName: project.documentPath,
        mimeType: request.file.mimetype,
      };
      let [_, error] = await asyncHandler(
        this.service.deleteOneFile(String(project.documentPath) + ".pdf")
      );
      data.documentCaption = String(file.fileName);
      [_, error] = await asyncHandler(
        this.service.deleteOneFile(project.documentPath)
      );
      [_, error] = await asyncHandler(this.service.uploadOneFile(file));
    }

    [project, error] = <[Project, any]>(
      await asyncHandler(this.service.updateOne(id, data))
    );

    if (error) return next(error);

    response.json({ success: true, project });
  };
}

export default ProjectController;

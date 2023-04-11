import { User, PrismaClient, PermissionType, DocType } from "@prisma/client";
import { Router, Request, Response, NextFunction } from "express";

import Controller from "../abstracts/Controller";

// User functionality
import UserService from "./user.service";
import {
  Id,
  UserData,
  IdSchema,
  LoginData,
  LoginSchema,
  UserSchema,
} from "./user.validation";

// Middleware
import validationMiddleware from "../middleware/validation.middleware";
import authMiddleware from "./../middleware/auth.middleware";
import permissionsMiddleware from "./../middleware/permissions.middleware";

// Helpers
import asyncHandler from "../helpers/asyncHandler.helper";
import { hashPassword, verifyPassword } from "../helpers/hashPassword.helper";
import { signToken } from "./../helpers/jwt.helper";
import logger from "./../helpers/logger.helper";

// Errors
import NotFoundError from "../errors/NotFoundError";
import ConflictError from "../errors/ConflictError";
import InternalServerError from "./../errors/InternalServerError";
import UnauthorizedError from "./../errors/UnauthorizedError";

class UserController extends Controller {
  public routes = {
    getAll: "",
    getOne: "/:id",
    getPermissions: "/:id/permissions",
    createOne: "",
    updateOne: "/:id",
    deleteOne: "/:id",
    logout: "/:id/logout",
    login: "/login",
    refreshToken: "/:id/refreshtoken",
  };
  public router: Router;

  private service: UserService;
  private prisma: PrismaClient;

  constructor() {
    super("/users", DocType.USER);

    this.router = Router();
    this.prisma = new PrismaClient();
    this.service = new UserService(this.prisma, this.docType);

    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(
      this.routes.getAll,
      authMiddleware,
      // : FIXME: fix permissions middleware
      permissionsMiddleware(this.prisma, PermissionType.READ, this.docType),
      this.getAll_route
    );

    this.router.get(
      this.routes.getOne,
      authMiddleware,
      // : FIXME: fix permissions middleware
      permissionsMiddleware(this.prisma, PermissionType.READ, this.docType),
      validationMiddleware(IdSchema),
      this.getOne_route
    );

    this.router.get(
      this.routes.getPermissions,
      authMiddleware,
      // : FIXME: fix permissions middleware
      permissionsMiddleware(this.prisma, PermissionType.READ, this.docType),
      validationMiddleware(IdSchema),
      this.getUserPermissions_route
    );

    this.router.post(
      this.routes.createOne,
      // authMiddleware,
      // : FIXME: fix permissions middleware
      // permissionsMiddleware(this.prisma, PermissionType.CREATE, this.docType),
      validationMiddleware(UserSchema),
      this.createOne_route
    );

    this.router.delete(
      this.routes.deleteOne,
      authMiddleware,
      // : FIXME: fix permissions middleware
      permissionsMiddleware(this.prisma, PermissionType.DELETE, this.docType),
      validationMiddleware(IdSchema),
      this.deleteOne_route
    );

    this.router.put(
      this.routes.updateOne,
      authMiddleware,
      // : FIXME: fix permissions middleware
      permissionsMiddleware(this.prisma, PermissionType.UPDATE, this.docType),
      validationMiddleware(UserSchema),
      this.updateOne_route
    );

    this.router.post(
      this.routes.login,
      validationMiddleware(LoginSchema),
      this.login_route
    );

    this.router.post(
      this.routes.logout,
      authMiddleware,
      validationMiddleware(IdSchema),
      this.logout_route
    );

    this.router.post(
      this.routes.refreshToken,
      authMiddleware,
      validationMiddleware(IdSchema),
      this.refreshToken
    );
  }

  /**
   * @desc        Gets all users
   * @method      GET
   * @path        /users
   * @access      private
   */
  private getAll_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const [users, error] = <[User[], any]>(
      await asyncHandler(this.service.findAll())
    );

    if (error) return next(error);

    response.json({
      success: true,
      users,
    });
  };

  /**
   * @desc        Gets one user by id
   * @method      GET
   * @path        /users
   * @access      private
   */
  private getOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    const [user, error] = <[User, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) {
      next(error);
      return;
    }

    if (!user) return next(new NotFoundError(`There is no such a user`));

    response.json({
      success: true,
      user,
    });
  };

  /**
   * @desc        Creates a user
   * @method      GET
   * @path        /users/:id/permissions
   * @access      private
   */
  private getUserPermissions_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    const [user, error] = <[User[], any]>await asyncHandler(
      this.prisma.user.findMany({
        where: { id },
        include: { Person: true },
      })
    );

    if (error) return next(error);

    response.status(200).json({ success: true, user });
  };

  /**
   * @desc        Creates a user
   * @method      POST
   * @path        /users
   * @access      private
   */
  private createOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const data = <UserData>request.body;

    const [hashedPassword, err] = <[string, any]>(
      await asyncHandler(hashPassword(data.User.password))
    );

    if (err) return next(new InternalServerError(err.message));

    let [user, error] = <[User, any]>(
      await asyncHandler(this.service.findOneByUsername(data.User.username))
    );

    if (error) return next(error);

    if (user)
      return next(
        new ConflictError(
          `A user with the username "${data.User.username}" already exists`
        )
      );

    data.User.password = hashedPassword;

    let token: string = "";
    [token, error] = <[string, any]>await asyncHandler(
      signToken(
        {
          username: data.User.username,
        },
        60 * 15
      )
    );

    if (error) return next(error);

    data.User.token = token;

    [user, error] = <[User, any]>(
      await asyncHandler(this.service.createOne(data))
    );

    if (error) return next(error);

    response.status(201).json({
      success: true,
      user,
    });
  };

  /**
   * @desc        Deletes a user
   * @method      DELETE
   * @path        /users/:id
   * @access      private
   */
  private deleteOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    let [user, error] = <[User, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!user)
      return next(
        new NotFoundError(`There is no such a user with the id of ${id}`)
      );

    [user, error] = <[User, any]>await asyncHandler(this.service.deleteOne(id));

    if (error) return next(error);

    response.status(204).json({ success: true });
  };

  /**
   * @desc        Updates a user
   * @method      PUT
   * @path        /users/:id
   * @access      private
   */
  private updateOne_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;
    const data = <UserData>request.body;

    let [user, error] = <[User, any]>(
      await asyncHandler(this.service.findOneById(id))
    );

    if (error) return next(error);

    if (!user)
      return next(
        new NotFoundError(`There is no such a user with the id of ${id}`)
      );

    // So that the jwt won't be updated
    data.User.token = user.token;

    [user, error] = <[User, any]>(
      await asyncHandler(this.service.updateOne(id, data))
    );

    if (error) return next(error);

    response.status(200).json({
      user,
      success: true,
    });
  };

  /**
   * @desc        Logins a user
   * @method      POST
   * @path        /users/login
   * @access      public
   */
  private login_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { username, password } = <LoginData>request.body;

    let [user, error] = await asyncHandler(
      this.service.findOneByUsername(username)
    );

    if (error) return next(error);

    if (!user)
      return next(
        new NotFoundError(
          `A user with the username of "${username}" does not exists`
        )
      );

    let _: boolean;
    [_, error] = <[boolean, any]>(
      await asyncHandler(verifyPassword(password, user.password))
    );

    if (error)
      return next(new UnauthorizedError("Incorrect username or password"));

    let token: string = "";
    [token, error] = <[string, any]>await asyncHandler(
      signToken(
        {
          username: user.username,
        },
        // : TODO: should be 15 minutes
        // : FIXME: fix using refresh token
        // 24h
        60 * 60 * 24
      )
    );

    if (error) return next(error);

    [user, error] = <[User, any]>(
      await asyncHandler(this.service.login(user.id, token))
    );

    response.json({
      success: true,
      user,
    });
  };

  /**
   * @desc        Gets all users
   * @method      POST
   * @path        /users/logout
   * @access      private
   * @note        The user will waits a second and will be logged out
   */
  private logout_route = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    let [user, error] = await asyncHandler(this.service.findOneById(id));

    if (error) return next(error);

    if (!user) return next(new NotFoundError(`There is no such a user`));

    let token: string = "";
    [token, error] = <[string, any]>await asyncHandler(
      signToken({
        username: user.username,
      })
    );

    if (error) return next(error);

    [user, error] = <[User, any]>(
      await asyncHandler(this.service.logout(id, token))
    );

    if (error) return next(error);

    response.json({
      success: true,
      token,
    });
  };

  /**
   * @desc        Refreshes an access token
   * @method      POST
   * @path        /users/:id/refreshtoken
   * @access      private
   */
  // : FIXME:
  private refreshToken = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { id } = <Id>request.params;

    let [user, error] = await asyncHandler(this.service.findOneById(id));

    if (error) return next(error);

    if (!user) return next(new NotFoundError(`There is no such a user`));

    let token: string = "";
    [token, error] = <[string, any]>await asyncHandler(
      signToken(
        {
          username: user.username,
        },
        // two hours
        60 * 60 * 2
      )
    );

    if (error) return next(error);

    [user, error] = <[User, any]>(
      await asyncHandler(this.service.logout(id, token))
    );

    if (error) return next(error);

    response.json({
      success: true,
      token,
    });
  };
}

export default UserController;

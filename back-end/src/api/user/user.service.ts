import { DocType, PrismaClient, User } from "@prisma/client";

import Service from "../abstracts/Service";
import InternalServerError from "../errors/InternalServerError";
import asyncHandler from "../helpers/asyncHandler.helper";
import { UserData } from "./user.validation";

class UserService extends Service {
  constructor(private prisma: PrismaClient, private docType: DocType) {
    super();
  }

  // : TODO: Add filters
  // pagination: Pagination
  public async findAll() {
    const [users, error] = <[User[], any]>await asyncHandler(
      this.prisma.user.findMany({
        include: { Person: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return users;
  }

  public async findOneById(id: string) {
    const [user, error] = <[User, any]>await asyncHandler(
      this.prisma.user.findUnique({
        select: {
          id: true,
          username: true,
          token: true,
          isActive: true,
          dateCreated: true,
          dateUpdated: true,
          Person: true,
        },
        where: { id },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return user;
  }

  public async findByName(name: string) {
    const [users, error] = <[User, any]>await asyncHandler(
      this.prisma.user.findMany({
        where: { Person: { fullName: name } },
        include: { Person: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return users;
  }

  public async findOneByUsername(username: string) {
    const [user, error] = <[User, any]>await asyncHandler(
      this.prisma.user.findUnique({
        where: { username },
        include: { Person: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return user;
  }

  public async findByEmail(email: string) {
    const [user, error] = <[User, any]>await asyncHandler(
      this.prisma.user.findFirst({
        where: {
          Person: {
            collegeEmail: email,
          },
        },
        include: { Person: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return user;
  }

  public async createOne(userData: UserData) {
    const [user, error] = <[User, any]>await asyncHandler(
      this.prisma.user.create({
        data: {
          ...userData.User,
          Person: {
            create: userData.Person,
          },
        },
        include: { Person: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return user;
  }

  public async updateOne(id: string, data: UserData) {
    const [user, error] = <[User, any]>await asyncHandler(
      this.prisma.user.update({
        data: {
          ...data.User,
          Person: {
            update: data.Person,
          },
        },
        where: { id },
        include: { Person: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return user;
  }

  public async deleteOne(id: string) {
    const [user, error] = <[User, any]>await asyncHandler(
      this.prisma.user.delete({
        where: { id },
        include: { Person: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return user;
  }

  public async login(id: string, token: string) {
    const [user, error] = <[User, any]>await asyncHandler(
      this.prisma.user.update({
        data: { token },
        where: { id },
        include: { Person: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return user;
  }

  public async logout(id: string, token: string) {
    const [_, error] = <[User, any]>await asyncHandler(
      this.prisma.user.update({
        data: { token },
        where: { id },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return token;
  }

  public async refreshToken(id: string, token: string) {
    const [_, error] = <[User, any]>await asyncHandler(
      this.prisma.user.update({
        data: { token },
        where: { id },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return token;
  }
}

export default UserService;

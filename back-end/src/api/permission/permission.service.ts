import {
  PrismaClient,
  Permission,
  DocType,
  PermissionType,
} from "@prisma/client";

import Service from "../abstracts/Service";
import InternalServerError from "../errors/InternalServerError";
import asyncHandler from "./../helpers/asyncHandler.helper";
import { ManyPermissionData, PermissionData } from "./permission.validation";

class PermissionService extends Service {
  constructor(private prisma: PrismaClient, private docType: DocType) {
    super();
  }

  // : TODO: Add filters
  // pagination: Pagination
  async findAll() {
    const [permissions, error] = <[Permission[], any]>(
      await asyncHandler(this.prisma.permission.findMany())
    );

    if (error) throw new InternalServerError(error.message);

    return permissions;
  }

  async findOneById(id: string) {
    const [permission, error] = <[Permission, any]>(
      await asyncHandler(this.prisma.permission.findUnique({ where: { id } }))
    );

    if (error) throw new InternalServerError(error.message);

    return permission;
  }

  async createOne(data: PermissionData) {
    const [permission, error] = <[Permission, any]>(
      await asyncHandler(this.prisma.permission.create({ data }))
    );

    if (error) throw new InternalServerError(error.message);

    return permission;
  }

  async createMany(data: ManyPermissionData) {
    const [permissions, error] = <[Permission[], any]>(
      await asyncHandler(this.prisma.permission.createMany({ data }))
    );

    if (error) throw new InternalServerError(error.message);

    return permissions;
  }

  async updateOne(id: string, data: PermissionData) {
    const [permission, error] = <[Permission, any]>(
      await asyncHandler(this.prisma.permission.update({ data, where: { id } }))
    );

    if (error) throw new InternalServerError(error.message);

    return permission;
  }

  async deleteOne(id: string) {
    const [permission, error] = <[Permission, any]>(
      await asyncHandler(this.prisma.permission.delete({ where: { id } }))
    );

    if (error) throw new InternalServerError(error.message);

    return permission;
  }
}

export default PermissionService;

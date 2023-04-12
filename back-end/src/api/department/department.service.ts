import { PrismaClient, Department, Doctype } from "@prisma/client";

import Service from "../abstracts/Service";
import InternalServerError from "../errors/InternalServerError";
import asyncHandler from "../helpers/asyncHandler.helper";
import { DepartmentData } from "./department.validation";

class DepartmentService extends Service {
  constructor(private prisma: PrismaClient, private doctype: Doctype) {
    super();
  }

  // : TODO: Add filters
  // pagination: Pagination
  async findAll() {
    const [departments, error] = <[Department[], any]>await asyncHandler(
      this.prisma.department.findMany({
        include: { StudyLevels: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return departments;
  }

  async findOneById(id: string) {
    const [department, error] = <[Department, any]>await asyncHandler(
      this.prisma.department.findUnique({
        where: { id },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return department;
  }

  async createOne(data: DepartmentData) {
    const [department, error] = <[Department, any]>(
      await asyncHandler(this.prisma.department.create({ data }))
    );

    if (error) throw new InternalServerError(error.message);

    return department;
  }

  async updateOne(id: string, data: DepartmentData) {
    const [department, error] = <[Department, any]>await asyncHandler(
      this.prisma.department.update({
        data,
        where: { id },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return department;
  }

  async deleteOne(id: string) {
    const [department, error] = <[Department, any]>await asyncHandler(
      this.prisma.department.delete({
        where: { id },
        include: { StudyLevels: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return department;
  }
}

export default DepartmentService;

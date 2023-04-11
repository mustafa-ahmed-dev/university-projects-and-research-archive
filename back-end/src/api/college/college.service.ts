import { PrismaClient, College, DocType } from "@prisma/client";

import Service from "./../abstracts/Service";
import InternalServerError from "./../errors/InternalServerError";
import asyncHandler from "../helpers/asyncHandler.helper";
import { CollegeData } from "./college.validation";

class CollegeService extends Service {
  constructor(private prisma: PrismaClient, private docType: DocType) {
    super();
  }

  // : TODO: Add filters
  // pagination: Pagination
  async findAll() {
    const [colleges, error] = <[College[], any]>await asyncHandler(
      this.prisma.college.findMany({
        include: { Departments: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return colleges;
  }

  async findOneById(id: string) {
    const [college, error] = <[College, any]>await asyncHandler(
      this.prisma.college.findUnique({
        where: { id },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return college;
  }

  async findOneByName(name: string) {
    const [college, error] = <[College, any]>await asyncHandler(
      this.prisma.college.findUnique({
        where: { name },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return college;
  }

  async createOne(data: CollegeData) {
    const [college, error] = <[College, any]>(
      await asyncHandler(this.prisma.college.create({ data }))
    );

    if (error) throw new InternalServerError(error.message);

    return college;
  }

  async updateOne(id: string, data: CollegeData) {
    const [college, error] = <[College, any]>await asyncHandler(
      this.prisma.college.update({
        data,
        where: { id },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return college;
  }

  async deleteOne(id: string) {
    const [college, error] = <[College, any]>await asyncHandler(
      this.prisma.college.delete({
        where: { id },
        include: { Departments: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return college;
  }
}

export default CollegeService;

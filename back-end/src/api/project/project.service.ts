import { PrismaClient, Project, DocType } from "@prisma/client";

import config from "./../../config";
import Service from "../abstracts/Service";
import InternalServerError from "../errors/InternalServerError";
import asyncHandler from "../helpers/asyncHandler.helper";
import { FiltersData, ProjectData } from "./project.validation";
import {
  createPutObjectCommand,
  createDeleteObjectCommand,
  ObjectData,
  createGetObjectCommand,
} from "../helpers/attachment.helper";
import NotFoundError from "./../errors/NotFoundError";

class ProjectService extends Service {
  constructor(private prisma: PrismaClient, private docType: DocType) {
    super();
  }

  // : TODO: Add filters
  // pagination: Pagination
  async findAll(filters: FiltersData) {
    const skip =
      filters.page &&
      filters.pageSize &&
      Number(filters.page) * Number(filters.pageSize);
    const take = filters.pageSize
      ? Number(filters.pageSize) <= config.api.maxPageSize
        ? Number(filters.pageSize)
        : config.api.maxPageSize
      : config.api.minPageSize;

    const [projects, error] = <[Project[], any]>await asyncHandler(
      this.prisma.project.findMany({
        include: {
          Students: { include: { Person: true } },
          Department: { include: { College: true } },
          Supervisor: { include: { Person: true } },
          _count: true,
        },
        orderBy: [{ year: "desc" }, { name: "asc" }],
        where: {
          id: filters?.id,
          year: filters?.year && Number(filters.year),
          name: { contains: filters.name },
          Department:
            filters?.department || filters?.college
              ? {
                  OR: {
                    name: filters?.department
                      ? {
                          contains: filters.department,
                        }
                      : undefined,
                    College: filters?.college
                      ? {
                          name: {
                            contains: filters.college,
                          },
                        }
                      : undefined,
                  },
                }
              : undefined,
          Supervisor: {
            Person: { fullName: { contains: filters.supervisor } },
          },
          Students: {
            some: {
              Person: { fullName: { contains: filters.student } },
            },
          },
        },
        skip,
        take,
      })
    );

    if (error) throw new InternalServerError(error.message);

    return projects;
  }

  async findById(id: string) {
    let [project, error] = <[Project, any]>await asyncHandler(
      this.prisma.project.findUnique({
        where: { id },
        include: {
          Students: { include: { Person: true } },
          Department: { include: { College: true } },
          Supervisor: { include: { Person: true } },
        },
      })
    );

    if (error) throw new InternalServerError(error.message);

    if (!project)
      throw new NotFoundError(`A project with the id of ${id} not found`);

    return project;
  }

  async findByName(name: string) {
    const [project, error] = <[Project, any]>await asyncHandler(
      this.prisma.project.findMany({
        where: { name: { contains: name } },
        include: {
          Students: true,
          Department: true,
          Supervisor: true,
        },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return project;
  }

  async createOne(data: ProjectData) {
    const [project, error] = <[Project, any]>await asyncHandler(
      this.prisma.project.create({
        data: { ...data, documentCaption: String(data.documentCaption) },
        include: {
          Department: true,
          Supervisor: true,
        },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return project;
  }

  async updateOne(id: string, data: ProjectData) {
    const [project, error] = <[Project, any]>await asyncHandler(
      this.prisma.project.update({
        data,
        where: { id },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return project;
  }

  async deleteOne(id: string) {
    const [project, error] = <[Project, any]>await asyncHandler(
      this.prisma.project.delete({
        where: { id },
        include: {
          Students: true,
          Department: true,
          Supervisor: true,
        },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return project;
  }

  async uploadOneFile(data: ObjectData) {
    try {
      await createPutObjectCommand(data);
    } catch (error) {
      throw new InternalServerError(error.message);
    }
  }

  async deleteOneFile(path: string) {
    try {
      await createDeleteObjectCommand(path);
    } catch (error) {
      throw new InternalServerError(error.message);
    }
  }

  async getOneFile(path: string) {
    try {
      return await createGetObjectCommand(path);
    } catch (error) {
      throw new InternalServerError(error.message);
    }
  }
}

export default ProjectService;

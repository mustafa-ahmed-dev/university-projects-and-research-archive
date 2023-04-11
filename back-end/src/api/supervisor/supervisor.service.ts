import { PrismaClient, Supervisor, DocType, Person } from "@prisma/client";

import Service from "../abstracts/Service";
import InternalServerError from "../errors/InternalServerError";
import asyncHandler from "../helpers/asyncHandler.helper";
import { SupervisorData, ManySupervisorData } from "./supervisor.validation";

class SupervisorService extends Service {
  constructor(private prisma: PrismaClient, private docType: DocType) {
    super();
  }

  // : TODO: Add filters
  // pagination: Pagination
  async findAll() {
    const [supervisors, error] = <[Supervisor[], any]>await asyncHandler(
      this.prisma.supervisor.findMany({
        include: { Person: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return supervisors;
  }

  async findOneById(id: string) {
    const [supervisor, error] = <[Supervisor, any]>await asyncHandler(
      this.prisma.supervisor.findUnique({
        where: { id },
        include: { Person: true, Projects: true },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return supervisor;
  }

  async findByName(name: string) {
    const [student, error] = <[Supervisor, any]>await asyncHandler(
      this.prisma.student.findMany({
        where: { Person: { fullName: { contains: name } } },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return student;
  }

  async createOne(data: SupervisorData) {
    const [supervisor, error] = <[Supervisor, any]>await asyncHandler(
      this.prisma.supervisor.create({
        data: { Person: { create: data.Person } },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return supervisor;
  }
  async createMany(data: ManySupervisorData) {
    let [people, error] = <[Person[], any]>await asyncHandler(
      this.prisma.person.createMany({
        data: data.map((person) => person.Person),
      })
    );

    if (error) throw new InternalServerError(error.message);

    let supervisors: Supervisor[];
    [supervisors, error] = <[Supervisor[], any]>await asyncHandler(
      this.prisma.supervisor.createMany({
        data: people.map((person) => {
          return { personId: person.id };
        }),
      })
    );

    if (error) throw new InternalServerError(error.message);

    return supervisors;
  }

  async updateOne(id: string, data: SupervisorData) {
    const [supervisor, error] = <[Supervisor, any]>await asyncHandler(
      this.prisma.supervisor.update({
        data: { Person: { update: data.Person } },
        where: { id },
      })
    );

    if (error) throw new InternalServerError(error.message);

    return supervisor;
  }

  async deleteOne(id: string) {
    const [supervisor, error] = <[Supervisor, any]>(
      await asyncHandler(this.prisma.supervisor.delete({ where: { id } }))
    );

    if (error) throw new InternalServerError(error.message);

    return supervisor;
  }
}

export default SupervisorService;

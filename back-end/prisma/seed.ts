import { faker } from "@faker-js/faker";
import { Gender, PrismaClient } from "@prisma/client";
import argon2 from "argon2";

import colleges from "./../data/colleges";

const prisma = new PrismaClient();

const createColleges = () => {
  colleges.forEach(async (college) => {
    await prisma.college.create({
      data: {
        name: college.name,
        Departments: {
          createMany: {
            data: college.departments.map((department) => {
              return { name: department };
            }),
          },
        },
      },
    });
  });
};

const createSupervisors = () => {
  prisma.department.findMany().then((departments) => {
    departments.forEach(async (department) => {
      for (let i = 0; i < 3; i++) {
        await prisma.supervisor.create({
          data: {
            Person: {
              create: {
                fullName: faker.name.fullName(),
                collegeEmail: faker.internet.email(),
                dateOfBirth: faker.date.birthdate(),
                Department: { connect: { id: department.id } },
                gender:
                  faker.name.sexType() === "male" ? Gender.Male : Gender.Female,
              },
            },
          },
        });
      }
    });
  });
};

const createProjects = () => {
  prisma.supervisor
    .findMany({
      include: { Person: { include: { Department: true } } },
    })
    .then((supervisors) => {
      supervisors.forEach(async (supervisor) => {
        await prisma.project.create({
          data: {
            name: faker.lorem.words(2),
            year: Math.floor(
              faker.datatype.number({
                min: 2020,
                max: new Date().getFullYear(),
              })
            ),
            rate: 0,
            description: faker.lorem.paragraph(),
            documentCaption: faker.system.commonFileName("pdf"),
            Supervisor: { connect: { id: supervisor.id } },
            Department: { connect: { id: supervisor.Person.Department.id } },
          },
        });
      });
    });
};

const createStudents = () => {
  prisma.project
    .findMany({
      include: { Department: true },
    })
    .then((projects) => {
      projects.forEach(async (project) => {
        for (let i = 0; i < 3; i++) {
          await prisma.student.create({
            data: {
              Person: {
                create: {
                  fullName: faker.name.fullName(),
                  collegeEmail: faker.internet.email(),
                  dateOfBirth: faker.date.birthdate(),
                  Department: { connect: { id: project.Department.id } },
                  gender:
                    faker.name.sexType() === "male"
                      ? Gender.Male
                      : Gender.Female,
                },
              },
              username: faker.internet.userName(),
              password: await argon2.hash("12345"),
              personalEmail: faker.internet.email(),
              Project: { connect: { id: project.id } },
            },
          });
        }
      });
    });
};

// :NOTE: run run one and comment the others
function main() {
  createColleges();
  // createSupervisors();
  // createProjects();
  // createStudents();
}

main();
// .then(async () => {
//   await prisma.$disconnect();
// })
// .catch(async (e) => {
//   console.error(e);
//   await prisma.$disconnect();
//   process.exit(1);
// });

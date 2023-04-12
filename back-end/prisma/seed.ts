import { faker } from "@faker-js/faker";
import { Gender, PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import fs from "fs";
import path from "path";

import { colleges } from "./../data";

const prisma = new PrismaClient();

const createColleges = () => {
  colleges.forEach((college) => {
    prisma.college
      .create({
        data: {
          name: college.name,
          Departments: {
            createMany: {
              data: college.departments,
            },
          },
        },
      })
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
  });
};

// :NOTE: run run one and comment the others
function main() {
  createColleges();
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

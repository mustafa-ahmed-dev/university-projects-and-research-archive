import { Gender, PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const users = [
  {
    username: "mustafaadmin",
    person: {
      fullName: "Mustafa Ahmed Mohammed",
      collegeEmail: "mustafa.admin@gmail.com",
      dateOfBirth: new Date("2001-05-22"),
      gender: Gender.Male,
    },
  },
  {
    username: "mohammedadmin",
    person: {
      fullName: "Mohammed Zrar Ahmed",
      collegeEmail: "mohammed.admin@gmail.com",
      dateOfBirth: new Date("2001-05-22"),
      gender: Gender.Male,
    },
  },
  {
    username: "yousifadmin",
    person: {
      fullName: "Yousif Qadir Khalid",
      collegeEmail: "yousif.admin@gmail.com",
      dateOfBirth: new Date("2001-05-22"),
      gender: Gender.Male,
    },
  },
  {
    username: "sajaadmin",
    person: {
      fullName: "Saja Attallah Mohammed",
      collegeEmail: "saja.admin@gmail.com",
      dateOfBirth: new Date("2001-05-22"),
      gender: Gender.Female,
    },
  },
];

(() => {
  // :TODO: check department id from database
  users.forEach(async (user) => {
    const userData = await prisma.person.create({
      data: {
        ...user.person,
        Department: { connect: { id: "1ab1dda8-955c-4074-baab-c0e71f3953fb" } },
        User: {
          create: {
            password: await argon2.hash("12345"),
            token: "",
            username: user.username,
          },
        },
      },
    });
  });
})();

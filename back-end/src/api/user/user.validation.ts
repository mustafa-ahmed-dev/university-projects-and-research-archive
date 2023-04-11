import { z } from "zod";
import { Gender } from "@prisma/client";

export const IdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    username: z.string().min(4).max(30),
    password: z.string().min(4),
  }),
});

export const UserSchema = z.object({
  body: z.object({
    User: z.object({
      username: z.string().min(4).max(30),
      password: z.string().min(4),
      token: z.string(),
      isActive: z.boolean().default(true),
    }),
    Person: z.object({
      fullName: z.string().max(50),
      dateOfBirth: z.coerce.date(),
      collegeEmail: z.string().email(),
      gender: z.enum([Gender.Male, Gender.Female]).default(Gender.Male),
      departmentId: z.string().uuid(),
    }),
  }),
});

type Id = z.infer<typeof IdSchema>["params"];
type UserData = z.infer<typeof UserSchema>["body"];
type LoginData = z.infer<typeof LoginSchema>["body"];

export { Id, UserData, LoginData };

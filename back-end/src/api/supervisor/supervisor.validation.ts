import { z } from "zod";
import { Gender } from "@prisma/client";

export const IdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const SupervisorSchema = z.object({
  body: z.object({
    Person: z.object({
      fullName: z.string().max(50),
      dateOfBirth: z.coerce.date(),
      collegeEmail: z.string().email(),
      gender: z.enum([Gender.Male, Gender.Female]).default(Gender.Male),
      departmentId: z.string().uuid(),
    }),
  }),
});

export const ManySupervisorSchema = z.object({
  body: z.array(
    z.object({
      Person: z.object({
        fullName: z.string().max(50),
        dateOfBirth: z.coerce.date(),
        collegeEmail: z.string().email(),
        gender: z.enum([Gender.Male, Gender.Female]).default(Gender.Male),
        departmentId: z.string().uuid(),
      }),
    })
  ),
});

type Id = z.infer<typeof IdSchema>["params"];
type SupervisorData = z.infer<typeof SupervisorSchema>["body"];
type ManySupervisorData = z.infer<typeof ManySupervisorSchema>["body"];

export { Id, SupervisorData, ManySupervisorData };

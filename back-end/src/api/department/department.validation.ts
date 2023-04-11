import { z } from "zod";

export const IdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const DepartmentSchema = z.object({
  body: z.object({
    name: z.string().max(45),
    collegeId: z.string().uuid(),
  }),
});

type Id = z.infer<typeof IdSchema>["params"];
type DepartmentData = z.infer<typeof DepartmentSchema>["body"];

export { Id, DepartmentData };

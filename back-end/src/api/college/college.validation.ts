import { z } from "zod";

export const IdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const CollegeSchema = z.object({
  body: z.object({
    name: z.string().max(35),
  }),
});

type Id = z.infer<typeof IdSchema>["params"];
type CollegeData = z.infer<typeof CollegeSchema>["body"];

export { Id, CollegeData };

import { z } from "zod";

import config from "./../../config";

export const FiltersSchema = z.object({
  query: z.object({
    id: z.string().uuid().optional(),
    name: z.string().optional(),
    college: z.string().uuid().optional(),
    department: z.string().uuid().optional(),
    supervisor: z.string().optional(),
    student: z.string().optional(),
    year: z.coerce
      .number()
      .int()
      .positive()
      .max(new Date().getFullYear())
      .optional(),
    page: z.coerce.number().int().min(0).optional(),
    pageSize: z.coerce
      .number()
      .int()
      .min(config.api.minPageSize)
      .max(config.api.maxPageSize)
      .optional(),
  }),
});

export const IdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const ProjectSchema = z.object({
  body: z.object({
    name: z.string(),
    rate: z.coerce.number().int().min(0).max(100),
    year: z.coerce.number().int().positive().max(new Date().getFullYear()),
    description: z.string().max(500),
    documentCaption: z.string().max(255).optional(),
    departmentId: z.string().uuid(),
    supervisorId: z.string().uuid(),
  }),
});

type Id = z.infer<typeof IdSchema>["params"];
type ProjectData = z.infer<typeof ProjectSchema>["body"];
type FiltersData = z.infer<typeof FiltersSchema>["query"];

export { Id, ProjectData, FiltersData };

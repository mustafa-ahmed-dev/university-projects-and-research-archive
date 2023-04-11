import { z } from "zod";
import { DocType, PermissionType } from "@prisma/client";

export const PermissionSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    docType: z.enum([
      DocType.COLLEGE,
      DocType.DEPARTMENT,
      DocType.PROJECT,
      DocType.STUDENT,
      DocType.SUPERVISOR,
      DocType.USER,
      DocType.PERMISSION,
    ]),
    permissionType: z.enum([
      PermissionType.CREATE,
      PermissionType.READ,
      PermissionType.UPDATE,
      PermissionType.DELETE,
    ]),
  }),
});

export const ManyPermissionSchema = z.object({
  body: z.array(
    z.object({
      userId: z.string().uuid(),
      docType: z.enum([
        DocType.COLLEGE,
        DocType.DEPARTMENT,
        DocType.PROJECT,
        DocType.STUDENT,
        DocType.SUPERVISOR,
        DocType.USER,
        DocType.PERMISSION,
      ]),
      permissionType: z.enum([
        PermissionType.CREATE,
        PermissionType.READ,
        PermissionType.UPDATE,
        PermissionType.DELETE,
      ]),
    })
  ),
});

export const IdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

type Id = z.infer<typeof IdSchema>["params"];
type PermissionData = z.infer<typeof PermissionSchema>["body"];
type ManyPermissionData = z.infer<typeof ManyPermissionSchema>["body"];

export { PermissionData, Id, ManyPermissionData };

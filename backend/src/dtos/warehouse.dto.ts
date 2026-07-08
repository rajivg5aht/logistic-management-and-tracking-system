import { z } from "zod";
import { WAREHOUSE_STATUSES } from "../models/warehouse.model";

export const AdminCreateWarehouseDTO = z.object({
  name: z.string().trim().min(1, "Warehouse name is required"),
  code: z.string().trim().min(1, "Warehouse code is required"),
  streetAddress: z.string().trim().optional().default(""),
  city: z.string().trim().optional().default(""),
  district: z.string().trim().optional().default(""),
  contactPhone: z.string().trim().optional().default(""),
  managerName: z.string().trim().optional().default(""),
  capacity: z.number().nonnegative().optional().default(0),
  status: z.enum(WAREHOUSE_STATUSES).optional().default("active"),
});

export type AdminCreateWarehouseDTO = z.infer<typeof AdminCreateWarehouseDTO>;

export const AdminUpdateWarehouseDTO = AdminCreateWarehouseDTO.partial().omit({
  code: true,
});

export type AdminUpdateWarehouseDTO = z.infer<typeof AdminUpdateWarehouseDTO>;

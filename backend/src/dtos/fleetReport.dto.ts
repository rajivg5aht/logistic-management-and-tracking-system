import { z } from "zod";

export const IncidentStatusDTO = z.object({
  status: z.enum(["open", "reviewing", "resolved"]),
});

export type IncidentStatusDTO = z.infer<typeof IncidentStatusDTO>;

export const FuelExpenseStatusDTO = z.object({
  status: z.enum(["submitted", "approved", "rejected"]),
});

export type FuelExpenseStatusDTO = z.infer<typeof FuelExpenseStatusDTO>;

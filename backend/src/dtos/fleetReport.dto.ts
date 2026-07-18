import { z } from "zod";
import { VEHICLE_FUEL_EXPENSE_STATUSES } from "../models/vehicleFuelExpense.model";

const OptionalReportNote = z.string().trim().max(800).optional();

export const AdminIncidentUpdateDTO = z.object({
  decision: z.enum(["normal", "maintenance_required"]),
  adminNote: OptionalReportNote,
});

export type AdminIncidentUpdateDTO = z.infer<typeof AdminIncidentUpdateDTO>;

export const AdminFuelExpenseUpdateDTO = z.object({
  status: z.enum(VEHICLE_FUEL_EXPENSE_STATUSES).optional(),
  adminNote: OptionalReportNote,
  rejectionReason: OptionalReportNote,
  paymentReference: z.string().trim().max(120).optional(),
});

export type AdminFuelExpenseUpdateDTO = z.infer<
  typeof AdminFuelExpenseUpdateDTO
>;

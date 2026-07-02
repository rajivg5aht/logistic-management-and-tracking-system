"use server";

import { cookies } from "next/headers";
import { createShipment, type CreateShipmentPayload, type Shipment } from "@/lib/api/shipment.api";

export type CreateShipmentState = {
  success: boolean;
  message?: string;
  shipment?: Shipment;
};

export async function createShipmentAction(
  payload: CreateShipmentPayload,
): Promise<CreateShipmentState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token_customer")?.value;

  if (!token) {
    return {
      success: false,
      message: "Your session has expired. Please log in again to place an order.",
    };
  }

  try {
    const shipment = await createShipment(token, payload);
    return { success: true, shipment };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create shipment",
    };
  }
}

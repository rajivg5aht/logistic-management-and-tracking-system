import { AssistantContextService } from "../../services/assistant-context.service";

const shipment = {
  id: "shipment-1",
  trackingId: "LN-123456",
  pickup: { city: "Kathmandu" },
  delivery: { city: "Pokhara" },
  status: "in-transit",
} as any;

describe("Unit: AssistantContextService", () => {
  test("returns a signed-in customer's matching shipment without using Mistral", async () => {
    const getMyShipments = jest.fn().mockResolvedValue([shipment]);
    const service = new AssistantContextService({
      shipments: { getMyShipments },
    });

    const context = await service.build(
      { id: "customer-1", role: "customer" },
      "Where is LN-123456?",
    );

    expect(getMyShipments).toHaveBeenCalledWith("customer-1");
    expect(context.response).toContain("found your shipment");
    expect(context.cards).toEqual([
      expect.objectContaining({ title: "LN-123456", href: "/tracking?trackingId=LN-123456" }),
    ]);
  });

  test("does not load shipment data for general tracking guidance", async () => {
    const getMyShipments = jest.fn();
    const service = new AssistantContextService({
      shipments: { getMyShipments },
    });

    await service.build(
      { id: "customer-1", role: "customer" },
      "How do I track a parcel?",
    );

    expect(getMyShipments).not.toHaveBeenCalled();
  });
});

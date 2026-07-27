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
      payments: { getMyPayments: jest.fn() },
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
      payments: { getMyPayments: jest.fn() },
    });

    await service.build(
      { id: "customer-1", role: "customer" },
      "How do I track a parcel?",
    );

    expect(getMyShipments).not.toHaveBeenCalled();
  });

  test("returns a local payment summary for the signed-in customer", async () => {
    const getMyPayments = jest.fn().mockResolvedValue([
      { status: "pending", amount: 1250 },
      { status: "paid", amount: 900 },
    ]);
    const service = new AssistantContextService({
      shipments: { getMyShipments: jest.fn() },
      payments: { getMyPayments },
    });

    const context = await service.build(
      { id: "customer-1", role: "customer" },
      "Show my payment summary",
    );

    expect(getMyPayments).toHaveBeenCalledWith("customer-1");
    expect(context.response).toContain("payment summary");
    expect(context.cards).toEqual([
      expect.objectContaining({
        title: "Payment summary",
        description: "1 pending payment ? Rs 1,250",
        href: "/payments",
      }),
    ]);
  });
});

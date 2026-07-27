import { PaymentService } from "./payment.service";
import { ShipmentService, type SafeShipment } from "./shipment.service";
import type {
  AssistantAction,
  AssistantCard,
  AssistantSuggestion,
  AssistantUser,
} from "../types/assistant.type";

export type AssistantContext = {
  cards: AssistantCard[];
  actions: AssistantAction[];
  suggestions: AssistantSuggestion[];
  response?: string;
};

type CustomerContextDependencies = {
  shipments: Pick<ShipmentService, "getMyShipments">;
  payments: Pick<PaymentService, "getMyPayments">;
};

const CUSTOMER_CONTEXT: Omit<AssistantContext, "cards" | "response"> = {
  actions: [
    { label: "Track shipment", href: "/tracking" },
    { label: "Book shipment", href: "/shipments" },
    { label: "View payments", href: "/payments" },
  ],
  suggestions: [
    { label: "My shipments", prompt: "Show my recent shipments" },
    { label: "My payments", prompt: "Show my payment summary" },
    { label: "Delivery stages", prompt: "Explain the delivery stages" },
  ],
};

const DRIVER_CONTEXT: Omit<AssistantContext, "cards" | "response"> = {
  actions: [
    { label: "My assignments", href: "/driver/assignments" },
    { label: "Open route", href: "/driver/route" },
    { label: "Fleet", href: "/driver/fleet" },
  ],
  suggestions: [
    { label: "Today's deliveries", prompt: "Show my active deliveries" },
    { label: "COD summary", prompt: "Show my COD summary" },
    { label: "Vehicle details", prompt: "Show my assigned vehicle" },
  ],
};

const ADMIN_CONTEXT: Omit<AssistantContext, "cards" | "response"> = {
  actions: [
    { label: "Shipments", href: "/admin/shipments" },
    { label: "Inquiries", href: "/admin/inquiries" },
    { label: "Fleet reports", href: "/admin/fleet/reports" },
  ],
  suggestions: [
    { label: "Operations summary", prompt: "Show the operations summary" },
    { label: "Open inquiries", prompt: "Show open inquiries" },
    { label: "Fleet alerts", prompt: "Show fleet alerts" },
  ],
};

export class AssistantContextService {
  private readonly shipments: CustomerContextDependencies["shipments"];
  private readonly payments: CustomerContextDependencies["payments"];

  constructor(dependencies: Partial<CustomerContextDependencies> = {}) {
    this.shipments = dependencies.shipments ?? new ShipmentService();
    this.payments = dependencies.payments ?? new PaymentService();
  }

  private shipmentCard(shipment: SafeShipment): AssistantCard {
    return {
      title: shipment.trackingId,
      description: `${shipment.status.replace(/-/g, " ")} ? ${shipment.pickup.city} to ${shipment.delivery.city}`,
      tone: shipment.status === "delivered" ? "success" : "default",
      href: `/tracking?trackingId=${encodeURIComponent(shipment.trackingId)}`,
    };
  }

  private async buildCustomerContext(
    user: AssistantUser,
    message: string,
  ): Promise<AssistantContext> {
    const context: AssistantContext = {
      cards: [],
      actions: CUSTOMER_CONTEXT.actions,
      suggestions: CUSTOMER_CONTEXT.suggestions,
    };
    const trackingId = message.match(/\bLN-\d{6}\b/i)?.[0]?.toUpperCase();

    if (trackingId) {
      const shipments = await this.shipments.getMyShipments(user.id);
      const shipment = shipments.find((item) => item.trackingId === trackingId);
      if (!shipment) {
        return {
          ...context,
          cards: [
            {
              title: trackingId,
              description: "No shipment with this tracking ID belongs to your account.",
              tone: "warning",
              href: `/tracking?trackingId=${encodeURIComponent(trackingId)}`,
            },
          ],
          response: "I could not find that tracking ID in your account. Check the ID or use Tracking to search again.",
        };
      }
      return {
        ...context,
        cards: [this.shipmentCard(shipment)],
        response: "I found your shipment. Its current details are shown below.",
      };
    }

    if (/\b(show|list|view)\s+(my\s+)?(shipment|shipments|delivery|deliveries|parcel|parcels)\b|\brecent\s+(shipment|shipments|delivery|deliveries|parcel|parcels)\b/i.test(message)) {
      const shipments = await this.shipments.getMyShipments(user.id);
      return {
        ...context,
        cards: shipments.slice(0, 3).map((shipment) => this.shipmentCard(shipment)),
        response: shipments.length
          ? "Here are your most recent shipments."
          : "You do not have any shipments yet. You can book one from the Shipments page.",
      };
    }

    if (/\b(show|list|view)\s+(my\s+)?(payment|payments|cod|invoice|invoices)\b|\bmy\s+(payment|payments|cod)\s+summary\b/i.test(message)) {
      const payments = await this.payments.getMyPayments(user.id);
      const pending = payments.filter((payment) => payment.status === "pending");
      const totalPending = pending.reduce(
        (total, payment) => total + payment.amount,
        0,
      );
      return {
        ...context,
        cards: [
          {
            title: "Payment summary",
            description: pending.length
              ? `${pending.length} pending payment${pending.length === 1 ? "" : "s"} ? Rs ${totalPending.toLocaleString("en-NP")}`
              : "No pending payments",
            tone: pending.length ? "warning" : "success",
            href: "/payments",
          },
        ],
        response: pending.length
          ? "Your current payment summary is shown below."
          : "You do not have any pending payments.",
      };
    }

    return context;
  }

  async build(user: AssistantUser, message = ""): Promise<AssistantContext> {
    if (user.role === "customer") {
      return this.buildCustomerContext(user, message);
    }

    const context =
      user.role === "driver"
        ? DRIVER_CONTEXT
        : user.role === "admin"
          ? ADMIN_CONTEXT
          : CUSTOMER_CONTEXT;

    return {
      cards: [],
      actions: context.actions,
      suggestions: context.suggestions,
    };
  }
}

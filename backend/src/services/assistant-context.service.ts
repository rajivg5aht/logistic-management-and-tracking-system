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
  async build(user: AssistantUser): Promise<AssistantContext> {
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

import type { ComponentProps, ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import AboutContent from "@/components/about/AboutContent";
import AnnouncementsFeed from "@/components/announcements/AnnouncementsFeed";
import { AiAssistant } from "@/components/assistant/AiAssistant";
import ContactContent from "@/components/contact/ContactContent";
import Network from "@/components/landing/Network";

const api = vi.hoisted(() => ({
  createInquiry: vi.fn(),
  getAnnouncements: vi.fn(),
  sendAssistantMessage: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/api/inquiry.api", () => ({ createInquiry: api.createInquiry }));
vi.mock("@/lib/api/announcement.api", () => ({
  getMyAnnouncements: api.getAnnouncements,
}));
vi.mock("@/lib/api/assistant.api", () => ({
  sendAssistantMessage: api.sendAssistantMessage,
}));
vi.mock("@/lib/hooks/useAutoRefresh", () => ({ useAutoRefresh: vi.fn() }));

describe("content, contact, announcements, and assistant UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.createInquiry.mockResolvedValue({ id: "inquiry-1" });
    api.getAnnouncements.mockResolvedValue([]);
    api.sendAssistantMessage.mockResolvedValue({
      message: "Open Tracking and enter your tracking ID.",
      model: "mistral-small-latest",
    });
  });

  test("renders the company mission, values, technology, and benefits", () => {
    render(<AboutContent />);
    expect(screen.getByText("Our Mission")).toBeInTheDocument();
    expect(screen.getByText("Our Vision")).toBeInTheDocument();
    expect(screen.getByText("Our Core Values")).toBeInTheDocument();
    expect(screen.getByText("Advanced Logistics Technology")).toBeInTheDocument();
    expect(screen.getByText("Why Choose Us")).toBeInTheDocument();
  });

  test("renders nationwide routes and the coverage registration link", () => {
    render(<Network />);
    expect(screen.getByText("Delivery Network")).toBeInTheDocument();
    expect(screen.getByText(/Kathmandu/)).toBeInTheDocument();
    expect(screen.getByText(/Pokhara/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view coverage map/i })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  test("opens and closes contact FAQ answers", async () => {
    const user = userEvent.setup();
    render(<ContactContent />);
    const firstQuestion = screen.getByRole("button", {
      name: "How do I track my shipment?",
    });
    expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
    await user.click(firstQuestion);
    expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
    const pickupQuestion = screen.getByRole("button", {
      name: "Do you provide home pick-up services?",
    });
    await user.click(pickupQuestion);
    expect(pickupQuestion).toHaveAttribute("aria-expanded", "true");
  });

  test("submits a public inquiry and shows confirmation", async () => {
    const user = userEvent.setup();
    render(<ContactContent />);
    await user.type(screen.getByLabelText("Full Name"), "Ram Laxmi");
    await user.type(screen.getByLabelText("Email Address"), "ram@example.com");
    await user.selectOptions(screen.getByLabelText("Subject"), "Support");
    await user.type(
      screen.getByLabelText("Message"),
      "Please help me track my parcel.",
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));
    await waitFor(() => expect(api.createInquiry).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("status")).toHaveTextContent("Thanks for reaching out");
  });

  test("shows a public inquiry submission error", async () => {
    api.createInquiry.mockRejectedValueOnce(new Error("Service unavailable"));
    const user = userEvent.setup();
    render(<ContactContent />);
    await user.type(screen.getByLabelText("Full Name"), "Ram Laxmi");
    await user.type(screen.getByLabelText("Email Address"), "ram@example.com");
    await user.type(screen.getByLabelText("Message"), "A valid inquiry message");
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Service unavailable");
  });

  test("opens and closes the AI assistant dialog", async () => {
    const user = userEvent.setup();
    render(<AiAssistant token="token" />);
    await user.click(screen.getByRole("button", { name: "Open AI Assistant" }));
    expect(screen.getByRole("dialog", { name: "AI Assistant" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close assistant" }));
    expect(screen.queryByRole("dialog", { name: "AI Assistant" })).not.toBeInTheDocument();
  });

  test("sends and clears an AI assistant conversation", async () => {
    const user = userEvent.setup();
    render(<AiAssistant token="customer-token" placement="navbar" />);
    await user.click(screen.getByRole("button", { name: "Open AI Assistant" }));
    await user.type(screen.getByLabelText("Message the assistant"), "Track my parcel");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText("Open Tracking and enter your tracking ID.")).toBeInTheDocument();
    expect(api.sendAssistantMessage).toHaveBeenCalledWith(
      "customer-token",
      expect.arrayContaining([{ role: "user", content: "Track my parcel" }]),
    );
    await user.click(
      screen.getByRole("button", { name: "Start a new conversation" }),
    );
    expect(screen.queryByText("Track my parcel")).not.toBeInTheDocument();
  });

  test("shows an AI assistant request error", async () => {
    api.sendAssistantMessage.mockRejectedValueOnce(new Error("Assistant unavailable"));
    const user = userEvent.setup();
    render(<AiAssistant token="token" />);
    await user.click(screen.getByRole("button", { name: "Open AI Assistant" }));
    await user.type(screen.getByLabelText("Message the assistant"), "Help");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Assistant unavailable");
  });

  test("renders the empty customer announcement state", async () => {
    render(<AnnouncementsFeed token="token" audienceName="customers" />);
    expect(await screen.findByText("No announcements yet")).toBeInTheDocument();
    expect(screen.getByText(/official CargoNep updates for customers/i)).toBeInTheDocument();
  });

  test("retries failed announcement loading and renders the update", async () => {
    api.getAnnouncements
      .mockRejectedValueOnce(new Error("Announcements unavailable"))
      .mockResolvedValueOnce([
        {
          id: "announcement-1",
          title: "Route update",
          message: "Pokhara deliveries are operating normally.",
          audience: "all",
          createdBy: "admin-1",
          createdAt: "2026-07-22T08:00:00.000Z",
          updatedAt: "2026-07-22T08:00:00.000Z",
        },
      ]);
    const user = userEvent.setup();
    render(<AnnouncementsFeed token="token" audienceName="drivers" />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Announcements unavailable",
    );
    await user.click(
      screen.getByRole("button", { name: "Retry loading announcements" }),
    );
    expect(await screen.findByText("Route update")).toBeInTheDocument();
  });
});

import type { ComponentProps, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import CoreSolutions from "@/components/landing/CoreSolutions";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Industries from "@/components/landing/Industries";
import Navbar from "@/components/landing/Navbar";
import Stats from "@/components/landing/Stats";
import LegalContent from "@/components/legal/LegalContent";
import { PageBreadcrumb } from "@/components/dashboard/PageBreadcrumb";
import { ShipmentSummaryCard } from "@/components/shipment/ShipmentSummaryCard";
import { StepProgressBar } from "@/components/shipment/StepProgressBar";
import Card from "@/components/ui/Card";
import DashboardPageSkeleton from "@/components/ui/DashboardPageSkeleton";
import Modal from "@/components/ui/Modal";

const navigation = vi.hoisted(() => ({
  pathname: "/",
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: ComponentProps<"img">) => <span role="img" aria-label={alt} />,
}));

describe("shared and public UI", () => {
  beforeEach(() => {
    navigation.pathname = "/";
    navigation.push.mockReset();
  });

  test("renders card content and interactive decoration", () => {
    const { container } = render(<Card glow>Shipment details</Card>);
    expect(screen.getByText("Shipment details")).toBeInTheDocument();
    expect(container.querySelector(".card-interactive")).toBeInTheDocument();
  });

  test("supports a non-interactive card", () => {
    const { container } = render(<Card hover={false}>Static information</Card>);
    expect(container.querySelector(".card-interactive")).not.toBeInTheDocument();
  });

  test("does not render a closed modal", () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="Confirm">Body</Modal>);
    expect(screen.queryByText("Confirm")).not.toBeInTheDocument();
  });

  test("renders and closes an open modal", async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="Confirm shipment">Body</Modal>);
    expect(document.body.style.overflow).toBe("hidden");
    await userEvent.click(screen.getByRole("button", { name: "Close modal" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("announces the dashboard loading skeleton", () => {
    render(<DashboardPageSkeleton />);
    expect(screen.getByRole("status", { name: "Loading page" })).toBeInTheDocument();
  });

  test("shows the national delivery statistics", () => {
    render(<Stats />);
    expect(screen.getByText("77")).toBeInTheDocument();
    expect(screen.getByText("99.8%")).toBeInTheDocument();
  });

  test("links each core logistics solution", () => {
    render(<CoreSolutions />);
    expect(screen.getByRole("link", { name: /Explore Booking/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /Live Dashboard/i })).toHaveAttribute("href", "/login");
  });

  test("shows industries served with six cargo categories", () => {
    render(<Industries />);
    expect(screen.getByRole("heading", { name: "Industries We Keep Moving" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);
    expect(screen.getByRole("heading", { name: "Retail & eCommerce" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Warehouse worker monitoring technology systems" })).toBeInTheDocument();
  });

  test("renders legal sections and update information", () => {
    render(
      <LegalContent
        title="Privacy Policy"
        description="How CargoNep protects data."
        lastUpdated="July 2026"
        sections={[{ title: "Information", body: ["We collect delivery details."] }]}
      />,
    );
    expect(screen.getByRole("heading", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByText("Last updated: July 2026")).toBeInTheDocument();
  });

  test("renders the configured booking progress steps", () => {
    render(
      <StepProgressBar
        steps={[
          { number: 1, label: "Addresses", active: true },
          { number: 2, label: "Package" },
        ]}
      />,
    );
    expect(screen.getByText("Addresses")).toBeInTheDocument();
    expect(screen.getByText("Package")).toBeInTheDocument();
  });

  test("shows the initial shipment summary state", () => {
    render(<ShipmentSummaryCard />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getAllByText("Pending")).toHaveLength(2);
  });

  test("shows completed earlier shipment steps", () => {
    render(<ShipmentSummaryCard currentStep={3} />);
    expect(screen.getAllByText("Completed")).toHaveLength(2);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  test("sends an empty tracking request to login", async () => {
    render(<Hero />);
    await userEvent.click(screen.getByRole("button", { name: /Track Now/i }));
    expect(navigation.push).toHaveBeenCalledWith("/login");
  });

  test("normalizes and opens a public tracking request", async () => {
    render(<Hero />);
    await userEvent.type(screen.getByRole("textbox", { name: "Tracking ID" }), " ln-98742 ");
    await userEvent.click(screen.getByRole("button", { name: /Track Now/i }));
    expect(navigation.push).toHaveBeenCalledWith("/track?trackingId=LN-98742");
  });

  test("opens and closes the mobile navigation", async () => {
    render(<Navbar />);
    const menu = screen.getByRole("button", { name: "Menu" });
    await userEvent.click(menu);
    expect(menu).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    expect(menu).toHaveAttribute("aria-expanded", "false");
  });

  test("renders footer service, social, and legal links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Twitter" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy-policy");
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeInTheDocument();
  });

  test("renders a breadcrumb for a known customer page", () => {
    navigation.pathname = "/shipments/history";
    render(<PageBreadcrumb />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent("Shipments");
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  test("omits breadcrumbs for unknown pages", () => {
    navigation.pathname = "/unknown";
    const { container } = render(<PageBreadcrumb />);
    expect(container).toBeEmptyDOMElement();
  });
});
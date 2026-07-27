import { render, screen } from "@testing-library/react";
import { Package } from "lucide-react";
import { describe, expect, test } from "vitest";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

describe("shared dashboard primitives", () => {
  test.each([
    ["Operations", "Monitor daily delivery activity"],
    ["Fleet", "Review vehicle readiness"],
    ["Payments", "Track collected COD balances"],
    ["Shipments", "Manage active consignments"],
    ["Support", "Follow customer requests"],
    ["Analytics", "Review service performance"],
    ["Profile", "Update account details"],
    ["Driver", "Review current assignments"],
    ["Network", "Understand nationwide coverage"],
    ["Settings", "Control workspace preferences"],
  ])("renders the %s page hierarchy", (title, description) => {
    render(<PageHeader eyebrow="Workspace" title={title} description={description} />);

    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  test.each([
    ["Active delivery", "1", "bg-[var(--info-soft)]"],
    ["Delivered today", "12", "bg-[var(--success-soft)]"],
    ["COD to collect", "Rs 2,000", "bg-[var(--danger-soft)]"],
    ["Vehicles ready", "8", "bg-[var(--accent-soft)]"],
    ["Open reports", "3", "bg-[var(--warning-soft)]"],
    ["New inquiries", "5", "bg-[var(--info-soft)]"],
    ["Payments settled", "21", "bg-[var(--success-soft)]"],
    ["Pending pickups", "7", "bg-[var(--accent-soft)]"],
    ["Routes planned", "14", "bg-[var(--info-soft)]"],
    ["Customer accounts", "33", "bg-[var(--success-soft)]"],
  ])("renders the %s metric", (label, value, tone) => {
    const { container } = render(
      <StatCard label={label} value={value} icon={Package} tone={tone} />,
    );

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(value)).toBeInTheDocument();
    expect(container.querySelector("article > div")?.className).toContain(tone);
  });
});

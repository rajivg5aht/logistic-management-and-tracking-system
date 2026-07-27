import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { PageHeader } from "@/components/ui/PageHeader";

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
});

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import Network from "@/components/landing/Network";
import { signOut } from "@/lib/auth/session";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

afterEach(() => vi.unstubAllGlobals());

describe("shared session and delivery network UI", () => {
  test.each([
    [200, true],
    [204, true],
    [400, false],
    [500, false],
  ])("handles sign-out response %i", async (status, ok) => {
    const fetchMock = vi.fn().mockResolvedValue({ ok, status });
    vi.stubGlobal("fetch", fetchMock);

    if (ok) {
      await expect(signOut()).resolves.toBeUndefined();
    } else {
      await expect(signOut()).rejects.toThrow("Unable to end this session");
    }
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
  });

  test.each([
    ["Nationwide Coverage"],
    ["An Unrivaled"],
    ["Delivery Network"],
    ["View Coverage Map"],
    ["Our proprietary logistics engine analyzes terrain and weather in real time, dynamically adjusting routes to conquer the most challenging geographical conditions of Nepal."],
    ["Map of Nepal showing our nationwide delivery coverage"],
    ["terrain and weather"],
    ["challenging geographical conditions"],
    ["real time"],
    ["dynamically adjusting routes"],
    ["conquer the most challenging"],
    ["conditions of Nepal"],
  ])("presents delivery-network content: %s", (text) => {
    render(<Network />);
    if (text.startsWith("Map of Nepal")) {
      expect(screen.getByAltText(text)).toBeInTheDocument();
      return;
    }
    expect(screen.getByText(text, { exact: false })).toBeInTheDocument();
  });
});

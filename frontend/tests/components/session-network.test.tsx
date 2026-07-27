import { afterEach, describe, expect, test, vi } from "vitest";
import { signOut } from "@/lib/auth/session";

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
});

import { isWithinNepalCoordinates } from "../../utils/nepalGeo.util";

describe("Unit: Nepal tracking bounds", () => {
  test("accepts live locations inside Nepal", () => {
    expect(isWithinNepalCoordinates(27.7172, 85.324)).toBe(true);
    expect(isWithinNepalCoordinates(27.671, 85.4298)).toBe(true);
  });

  test("rejects globally valid coordinates outside Nepal", () => {
    expect(isWithinNepalCoordinates(37.7749, -122.4194)).toBe(false);
    expect(isWithinNepalCoordinates(0, 0)).toBe(false);
  });

  test("rejects non-finite coordinates", () => {
    expect(isWithinNepalCoordinates(Number.NaN, 85.324)).toBe(false);
    expect(isWithinNepalCoordinates(27.7172, Number.POSITIVE_INFINITY)).toBe(
      false,
    );
  });
});

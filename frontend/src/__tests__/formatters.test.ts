import { describe, it, expect } from "vitest";
import { formatCurrency, parseAmount, getBillingCycleLabel } from "../shared/utils/formatters";

describe("formatCurrency", () => {
  it("formats ARS with thousands separator", () => {
    const result = formatCurrency(1234567, "ARS");
    expect(result).toContain("1.234.567");
    expect(result).toContain("$");
  });

  it("formats USD with thousands separator", () => {
    const result = formatCurrency(5000, "USD");
    expect(result).toContain("5.000");
    expect(result).toContain("US$");
  });

  it("returns formatted 0 for null", () => {
    const result = formatCurrency(null as any, "ARS");
    expect(result).toContain("0");
  });
});

describe("parseAmount", () => {
  it("parses string number", () => {
    expect(parseAmount("1234.56")).toBe(1234.56);
  });

  it("returns 0 for null", () => {
    expect(parseAmount(null as any)).toBe(0);
  });
});

describe("getBillingCycleLabel", () => {
  it("returns Mensual for monthly", () => {
    expect(getBillingCycleLabel("monthly")).toBe("Mensual");
  });

  it("returns Anual for yearly", () => {
    expect(getBillingCycleLabel("yearly")).toBe("Anual");
  });

  it("returns cycle as-is when unknown", () => {
    expect(getBillingCycleLabel("unknown")).toBe("unknown");
  });
});

import { formatPLN } from "./format";

const norm = (s: string) => s.replace(/\s/g, " ");

describe("formatPLN", () => {
  it("formats grosz as PLN", () => {
    expect(norm(formatPLN(34999))).toBe("349,99 zł");
  });
  it("formats whole amounts with two decimals", () => {
    expect(norm(formatPLN(12000))).toBe("120,00 zł");
  });
  it("formats zero", () => {
    expect(norm(formatPLN(0))).toBe("0,00 zł");
  });
});

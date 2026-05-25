import { generateToken, hashToken } from "@/lib/tokens";

describe("tokens", () => {
  test("generateToken returns 64 char hex string", () => {
    const token = generateToken();
    expect(token).toHaveLength(64);
    expect(/^[a-f0-9]+$/.test(token)).toBe(true);
  });

  test("hashToken is deterministic", () => {
    const token = "abc123";
    expect(hashToken(token)).toBe(hashToken(token));
  });

  test("hashToken produces different output for different input", () => {
    expect(hashToken("a")).not.toBe(hashToken("b"));
  });

  test("generateToken produces unique tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()));
    expect(tokens.size).toBe(100);
  });
});

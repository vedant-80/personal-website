import { auth } from "@/lib/auth";
import { getAdminSession, requireAdmin } from "@/lib/admin-guard";
import { isAdminEmail, safeReturnPath } from "@/lib/admin-identity";
import { redirect } from "next/navigation";

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn(() => { throw new Error("redirect"); }) }));
const originalEnv = process.env;
beforeEach(() => { jest.clearAllMocks(); process.env = { ...originalEnv, ADMIN_EMAIL: "Owner@Example.com" }; });
afterAll(() => { process.env = originalEnv; });

test("owner identity fails closed without configuration and rejects other accounts", () => {
  expect(isAdminEmail("owner@example.com")).toBe(true);
  expect(isAdminEmail("stranger@example.com")).toBe(false);
  expect(isAdminEmail(undefined)).toBe(false);
  delete process.env.ADMIN_EMAIL;
  expect(isAdminEmail("owner@example.com")).toBe(false);
});

test("one owner session authorizes access independent of the current public route", async () => {
  const session = { user: { email: "owner@example.com" }, expires: "2099-01-01" };
  (auth as jest.Mock).mockResolvedValue(session);
  expect(await getAdminSession()).toBe(session);
  expect(await requireAdmin("/admin/posts/new?kind=project")).toBe(session);
  expect(await requireAdmin("/admin/posts/new?kind=blog")).toBe(session);
  expect(redirect).not.toHaveBeenCalled();
});

test("non-owner sessions cannot enter admin routes", async () => {
  (auth as jest.Mock).mockResolvedValue({ user: { email: "stranger@example.com" } });
  expect(await getAdminSession()).toBeNull();
  await expect(requireAdmin("/admin/posts/new?kind=project")).rejects.toThrow("redirect");
  expect(redirect).toHaveBeenCalledWith("/api/auth/signin?callbackUrl=%2Fadmin%2Fposts%2Fnew%3Fkind%3Dproject");
});

test.each(["https://evil.example", "//evil.example", "/\\evil.example", "/api/auth/signout", "/\n/evil.example"])("rejects an unsafe login return path %s", (path) => {
  expect(safeReturnPath(path)).toBe("/admin");
});

test("retains safe public and admin return paths", () => {
  expect(safeReturnPath("/projects/a-project")).toBe("/projects/a-project");
  expect(safeReturnPath("/admin/posts/new?kind=project")).toBe("/admin/posts/new?kind=project");
});

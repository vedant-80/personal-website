import { createPost, deletePost, getPost, getPosts, getPublishedPost, getPublishedPosts, unpublishPost, updatePost } from "@/lib/actions/posts";
import { requireAdmin } from "@/lib/admin-guard";
import { notifySubscribers } from "@/lib/actions/notify-subscribers";
import { revalidatePath } from "next/cache";

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();
const mockFindFirst = jest.fn();
const mockTransaction = jest.fn();
const mockTxFind = jest.fn();
const mockTxUpdate = jest.fn();
jest.mock("@/lib/db", () => ({ prisma: {
  post: {
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    findUnique: (...args: unknown[]) => mockFindUnique(...args),
    findMany: (...args: unknown[]) => mockFindMany(...args),
    findFirst: (...args: unknown[]) => mockFindFirst(...args),
  },
  $transaction: (...args: unknown[]) => mockTransaction(...args),
} }));
jest.mock("@/lib/admin-guard", () => ({ requireAdmin: jest.fn() }));
jest.mock("@/lib/actions/notify-subscribers", () => ({ notifySubscribers: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const project = { id: "project1", slug: "my-project", title: "My project", kind: "project", status: "published", excerpt: "A project", publishedAt: new Date("2026-01-01") };
function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ id: project.id, title: project.title, kind: "project", status: "published", content: JSON.stringify([{ type: "text", text: "A project" }]), ...overrides })) data.set(key, value);
  data.append("flairs", "technical");
  data.append("flairs", "technical");
  return data;
}
beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(requireAdmin).mockResolvedValue({ user: { email: "owner@example.com" }, expires: "2099-01-01" });
  jest.mocked(notifySubscribers).mockResolvedValue(undefined);
  mockCreate.mockResolvedValue(project);
  mockUpdate.mockResolvedValue(project);
  mockDelete.mockResolvedValue(project);
  mockTxFind.mockResolvedValue(project);
  mockTxUpdate.mockResolvedValue(project);
  mockFindMany.mockResolvedValue([]);
  mockFindFirst.mockResolvedValue(project);
  mockTransaction.mockImplementation(async (run: (tx: unknown) => unknown) => run({ post: { findUnique: mockTxFind, update: mockTxUpdate } }));
});

test.each([
  ["create", () => createPost(form())],
  ["update", () => updatePost(form())],
  ["delete", () => deletePost(project.id)],
  ["unpublish", () => unpublishPost(project.id)],
  ["private list", () => getPosts()],
  ["private detail", () => getPost(project.id)],
] as const)("unauthorized %s is denied before any database access", async (_, action) => {
  jest.mocked(requireAdmin).mockRejectedValue(new Error("Unauthorized"));
  await expect(action()).rejects.toThrow("Unauthorized");
  for (const query of [mockCreate, mockUpdate, mockDelete, mockFindUnique, mockFindMany, mockFindFirst, mockTransaction]) expect(query).not.toHaveBeenCalled();
  expect(notifySubscribers).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("public collection/detail queries enforce published status and the requested content kind", async () => {
  await getPublishedPosts(["technical"], "project");
  expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { kind: "project", status: "published", flairs: { some: { flair: { slug: { in: ["technical"] } } } } } }));
  await getPublishedPosts();
  expect(mockFindMany).toHaveBeenLastCalledWith(expect.objectContaining({ where: { kind: "blog", status: "published" } }));
  await getPublishedPost("my-project", "project");
  expect(mockFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { slug: "my-project", kind: "project", status: "published" } }));
  expect(requireAdmin).not.toHaveBeenCalled();
});

test("project creation persists deduplicated flairs and never mails blog subscribers", async () => {
  await expect(createPost(form())).resolves.toEqual({ id: project.id, slug: project.slug, kind: "project" });
  expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ kind: "project", status: "published", content: [{ type: "text", text: "A project" }], flairs: { create: [{ flairId: "technical" }] } }) }));
  expect(notifySubscribers).not.toHaveBeenCalled();
  expect(revalidatePath).toHaveBeenCalledWith("/projects");
  expect(revalidatePath).toHaveBeenCalledWith("/projects/my-project");
});

test.each([
  [{ type: "youtube", url: "https://evil.example/watch?v=dQw4w9WgXcQ" }],
  [{ type: "image", src: "javascript:alert(1)" }],
  [{ type: "image", src: "//evil.example/image.jpg" }],
])("invalid video or image input is rejected before persistence: %j", async (block) => {
  await expect(createPost(form({ content: JSON.stringify([block]) }))).rejects.toThrow("valid");
  expect(mockCreate).not.toHaveBeenCalled();
});

test("update preserves content kind and replaces flairs in the same transaction", async () => {
  mockTxFind.mockResolvedValue({ ...project, status: "draft", publishedAt: null });
  await updatePost(form());
  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockTxFind).toHaveBeenCalledWith({ where: { id: project.id } });
  const update = mockTxUpdate.mock.calls[0][0];
  expect(update.where).toEqual({ id: project.id });
  expect(update.data.flairs).toEqual({ deleteMany: {}, create: [{ flairId: "technical" }] });
  expect(update.data).not.toHaveProperty("kind");
  expect(update.data.publishedAt).toBeInstanceOf(Date);
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(notifySubscribers).not.toHaveBeenCalled();
});

test("update rejects content-kind tampering without writing", async () => {
  await expect(updatePost(form({ kind: "blog" }))).rejects.toThrow("cannot be changed");
  expect(mockTxUpdate).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("update rejects missing records without writing", async () => {
  mockTxFind.mockResolvedValue(null);
  await expect(updatePost(form())).rejects.toThrow("not found");
  expect(mockTxUpdate).not.toHaveBeenCalled();
});

test("blog publication sends subscribers only after persistence", async () => {
  const blog = { ...project, kind: "blog" };
  mockCreate.mockResolvedValue(blog);
  await createPost(form({ kind: "blog" }));
  expect(notifySubscribers).toHaveBeenCalledWith(blog);
  expect(mockCreate.mock.invocationCallOrder[0]).toBeLessThan(jest.mocked(notifySubscribers).mock.invocationCallOrder[0]);
});

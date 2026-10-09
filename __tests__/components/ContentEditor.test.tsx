import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ContentEditor, type EditorPost } from "@/components/content/ContentEditor";
import { createPost, updatePost } from "@/lib/actions/posts";

const push = jest.fn();
const refresh = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));
jest.mock("@/lib/actions/posts", () => ({ createPost: jest.fn(), updatePost: jest.fn() }));

const initial: EditorPost = {
  id: "project-1", kind: "project", title: "Existing project", status: "published", flairIds: ["technical"],
  content: [{ type: "text", text: "Original paragraph" }, { type: "image", src: "/photo.jpg", alt: "Original photo" }, { type: "youtube", url: "https://youtu.be/dQw4w9WgXcQ" }],
};
const flairs = [{ id: "technical", slug: "technical", name: "Technical" }];
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(updatePost).mockResolvedValue({ id: "project-1", slug: "existing-project", kind: "project" });
  jest.mocked(createPost).mockResolvedValue({ id: "project-2", slug: "new-project", kind: "project" });
});

test("editing the title preserves existing image, video, text and flairs", async () => {
  render(<ContentEditor post={initial} flairs={flairs} />);
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Updated title" } });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(updatePost).toHaveBeenCalledTimes(1));
  const data = jest.mocked(updatePost).mock.calls[0][0];
  expect(JSON.parse(String(data.get("content")))).toEqual(initial.content);
  expect(data.getAll("flairs")).toEqual(["technical"]);
  expect(data.get("kind")).toBe("project");
  expect(data.get("title")).toBe("Updated title");
  await waitFor(() => expect(push).toHaveBeenCalledWith("/projects/existing-project"));
});

test("reordering and removing mixed blocks persists the intended order", async () => {
  render(<ContentEditor post={initial} flairs={flairs} />);
  fireEvent.click(screen.getByRole("button", { name: "Move block 2 up" }));
  fireEvent.click(screen.getByRole("button", { name: "Remove block 2" }));
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(updatePost).toHaveBeenCalledTimes(1));
  const data = jest.mocked(updatePost).mock.calls[0][0];
  expect(JSON.parse(String(data.get("content")))).toEqual([initial.content[1], initial.content[2]]);
});

test("invalid YouTube URLs are rejected before persistence", async () => {
  render(<ContentEditor post={initial} flairs={flairs} />);
  fireEvent.change(screen.getByLabelText("YouTube URL"), { target: { value: "https://example.com/not-youtube" } });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("valid YouTube video URL");
  expect(updatePost).not.toHaveBeenCalled();
});

test("failed saves show an error and allow retry without losing blocks", async () => {
  jest.mocked(updatePost).mockRejectedValueOnce(new Error("Connection unavailable"));
  render(<ContentEditor post={initial} flairs={flairs} />);
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Connection unavailable");
  expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(updatePost).toHaveBeenCalledTimes(2));
  expect(JSON.parse(String(jest.mocked(updatePost).mock.calls[1][0].get("content")))).toEqual(initial.content);
});

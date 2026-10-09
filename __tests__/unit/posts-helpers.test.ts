import { slugify, extractPlaintext, estimateReadingTime, type ContentBlock } from "@/lib/content-model";

describe("post helpers", () => {
  describe("slugify", () => {
    test("lowercases and replaces spaces with hyphens", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    test("strips special characters", () => {
      expect(slugify("What's Up? 100%")).toBe("what-s-up-100");
    });

    test("truncates at 80 chars", () => {
      const long = "a".repeat(100);
      expect(slugify(long).length).toBeLessThanOrEqual(80);
    });

    test("removes leading/trailing hyphens", () => {
      expect(slugify("--hello--")).toBe("hello");
    });
  });

  describe("extractPlaintext", () => {
    test("extracts text blocks only", () => {
      const content: ContentBlock[] = [
        { type: "text", text: "Hello" },
        { type: "image", src: "img.png" },
        { type: "text", text: "World" },
      ];
      expect(extractPlaintext(content)).toBe("Hello\nWorld");
    });

    test("returns empty string for no text blocks", () => {
      expect(extractPlaintext([{ type: "image", src: "/image.png" }])).toBe("");
    });
  });

  describe("estimateReadingTime", () => {
    test("returns at least 1 minute", () => {
      expect(estimateReadingTime("short")).toBe(1);
    });

    test("estimates correctly for ~238 words", () => {
      const words = Array(238).fill("word").join(" ");
      expect(estimateReadingTime(words)).toBe(1);
    });

    test("estimates correctly for ~476 words", () => {
      const words = Array(476).fill("word").join(" ");
      expect(estimateReadingTime(words)).toBe(2);
    });
  });
});

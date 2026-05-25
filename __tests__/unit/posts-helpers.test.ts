describe("post helpers", () => {
  function slugify(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  }

  function extractPlaintext(content: { type: string; text?: string }[]): string {
    return content
      .filter((block) => block.type === "text" && block.text)
      .map((block) => block.text)
      .join("\n");
  }

  function estimateReadingTime(text: string): number {
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.round(words / 238));
  }

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
      const content = [
        { type: "text", text: "Hello" },
        { type: "image", src: "img.png" },
        { type: "text", text: "World" },
      ];
      expect(extractPlaintext(content)).toBe("Hello\nWorld");
    });

    test("returns empty string for no text blocks", () => {
      expect(extractPlaintext([{ type: "image" }])).toBe("");
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

describe("email gating", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("sendEmail sinks in non-production", async () => {
    process.env.NODE_ENV = "development";
    process.env.EMAIL_SEND_MODE = "sink";

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { sendEmail } = await import("@/lib/email");

    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>hello</p>",
    });

    expect(result).toEqual({ id: "sink" });
    expect(consoleSpy).toHaveBeenCalledWith(
      "[EMAIL SINK]",
      expect.objectContaining({ to: "test@example.com" })
    );

    consoleSpy.mockRestore();
  });
});

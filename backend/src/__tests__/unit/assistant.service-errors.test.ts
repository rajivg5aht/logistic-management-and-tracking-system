import { AssistantService } from "../../services/assistant.service";

const config = {
  apiKey: "test-mistral-key",
  apiUrl: "https://api.mistral.ai/v1",
  model: "mistral-small-latest",
};

const chat = (request: typeof fetch) =>
  new AssistantService(config, request).chat(
    [{ role: "user", content: "Where is my parcel?" }],
    "customer",
  );

describe("Unit: AssistantService response handling", () => {
  test("joins valid text chunks while ignoring non-text and blank chunks", async () => {
    const joinedRequest = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: [
                  { type: "text", text: "Open Tracking." },
                  { type: "text", text: "Enter your tracking ID." },
                ],
              },
            },
          ],
        }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch;
    await expect(chat(joinedRequest)).resolves.toMatchObject({
      message: "Open Tracking.\nEnter your tracking ID.",
    });

    const filteredRequest = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: [
                  { type: "image", text: "ignore this" },
                  { type: "text", text: "  Use the dashboard  " },
                  { type: "text", text: "   " },
                ],
              },
            },
          ],
        }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch;
    await expect(chat(filteredRequest)).resolves.toMatchObject({
      message: "Use the dashboard",
    });
  });

  test("maps authentication, quota, and generic upstream HTTP failures", async () => {
    for (const status of [401, 403]) {
      const request = jest.fn().mockResolvedValue(
        new Response("{}", { status }),
      ) as unknown as typeof fetch;
      await expect(chat(request)).rejects.toMatchObject({
        status: 503,
        message: expect.stringContaining("key"),
      });
    }

    const quotaRequest = jest.fn().mockResolvedValue(
      new Response("{}", { status: 402 }),
    ) as unknown as typeof fetch;
    await expect(chat(quotaRequest)).rejects.toMatchObject({
      status: 503,
      message: expect.stringContaining("quota"),
    });

    const serverRequest = jest.fn().mockResolvedValue(
      new Response("{}", { status: 500 }),
    ) as unknown as typeof fetch;
    await expect(chat(serverRequest)).rejects.toMatchObject({ status: 502 });
  });

  test("handles malformed, empty, timed-out, and unavailable responses", async () => {
    const invalidJsonRequest = jest.fn().mockResolvedValue(
      new Response("not-json", { status: 200 }),
    ) as unknown as typeof fetch;
    await expect(chat(invalidJsonRequest)).rejects.toMatchObject({
      status: 502,
      message: "Mistral returned an invalid response.",
    });

    const emptyRequest = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [] }), { status: 200 }),
    ) as unknown as typeof fetch;
    await expect(chat(emptyRequest)).rejects.toMatchObject({
      status: 502,
      message: "Mistral returned an empty response.",
    });

    const timeout = Object.assign(new Error("timed out"), {
      name: "TimeoutError",
    });
    const timeoutRequest = jest
      .fn()
      .mockRejectedValue(timeout) as unknown as typeof fetch;
    await expect(chat(timeoutRequest)).rejects.toMatchObject({
      status: 504,
      message: expect.stringContaining("too long"),
    });

    const networkRequest = jest
      .fn()
      .mockRejectedValue(new Error("connection refused")) as unknown as typeof fetch;
    await expect(chat(networkRequest)).rejects.toMatchObject({
      status: 502,
      message: expect.stringContaining("temporarily unavailable"),
    });
  });
});

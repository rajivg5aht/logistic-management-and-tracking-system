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
  test("joins text chunks returned by the assistant API", async () => {
    const request = jest.fn().mockResolvedValue(
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

    await expect(chat(request)).resolves.toMatchObject({
      message: "Open Tracking.\nEnter your tracking ID.",
    });
  });

  test("ignores non-text and blank response chunks", async () => {
    const request = jest.fn().mockResolvedValue(
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

    await expect(chat(request)).resolves.toMatchObject({
      message: "Use the dashboard",
    });
  });

  test("maps an unauthorized response to a configuration error", async () => {
    const request = jest.fn().mockResolvedValue(
      new Response("{}", { status: 401 }),
    ) as unknown as typeof fetch;

    await expect(chat(request)).rejects.toMatchObject({
      status: 503,
      message: expect.stringContaining("key"),
    });
  });

  test("maps a forbidden response to a configuration error", async () => {
    const request = jest.fn().mockResolvedValue(
      new Response("{}", { status: 403 }),
    ) as unknown as typeof fetch;

    await expect(chat(request)).rejects.toMatchObject({
      status: 503,
      message: expect.stringContaining("key"),
    });
  });

  test("maps an unavailable free-tier quota to a service error", async () => {
    const request = jest.fn().mockResolvedValue(
      new Response("{}", { status: 402 }),
    ) as unknown as typeof fetch;

    await expect(chat(request)).rejects.toMatchObject({
      status: 503,
      message: expect.stringContaining("quota"),
    });
  });

  test("maps other upstream failures to a gateway error", async () => {
    const request = jest.fn().mockResolvedValue(
      new Response("{}", { status: 500 }),
    ) as unknown as typeof fetch;

    await expect(chat(request)).rejects.toMatchObject({ status: 502 });
  });

  test("rejects a successful response containing invalid JSON", async () => {
    const request = jest.fn().mockResolvedValue(
      new Response("not-json", { status: 200 }),
    ) as unknown as typeof fetch;

    await expect(chat(request)).rejects.toMatchObject({
      status: 502,
      message: "Mistral returned an invalid response.",
    });
  });

  test("rejects a successful response without message content", async () => {
    const request = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [] }), { status: 200 }),
    ) as unknown as typeof fetch;

    await expect(chat(request)).rejects.toMatchObject({
      status: 502,
      message: "Mistral returned an empty response.",
    });
  });

  test("reports assistant request timeouts as status 504", async () => {
    const timeout = Object.assign(new Error("timed out"), { name: "TimeoutError" });
    const request = jest.fn().mockRejectedValue(timeout) as unknown as typeof fetch;

    await expect(chat(request)).rejects.toMatchObject({
      status: 504,
      message: expect.stringContaining("too long"),
    });
  });

  test("reports network failures as a temporary gateway error", async () => {
    const request = jest
      .fn()
      .mockRejectedValue(new Error("connection refused")) as unknown as typeof fetch;

    await expect(chat(request)).rejects.toMatchObject({
      status: 502,
      message: expect.stringContaining("temporarily unavailable"),
    });
  });
});

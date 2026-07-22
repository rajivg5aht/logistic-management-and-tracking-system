import { AssistantService } from "../../services/assistant.service";

const config = {
  apiKey: "test-mistral-key",
  apiUrl: "https://api.mistral.ai/v1",
  model: "mistral-small-latest",
};

describe("Unit: AssistantService", () => {
  test("sends conversation context to Mistral and returns its reply", async () => {
    const request = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            { message: { content: "Open Tracking and enter your tracking ID." } },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    ) as unknown as typeof fetch;
    const service = new AssistantService(config, request);

    const result = await service.chat(
      [{ role: "user", content: "How do I track my parcel?" }],
      "customer",
    );

    expect(result).toEqual({
      message: "Open Tracking and enter your tracking ID.",
      model: "mistral-small-latest",
    });
    expect(request).toHaveBeenCalledTimes(1);

    const options = (request as jest.Mock).mock.calls[0][1] as RequestInit;
    const body = JSON.parse(options.body as string);
    expect(body.model).toBe("mistral-small-latest");
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[0].content).toContain(
      "Format section headers with exactly one leading #",
    );
    expect(body.messages[0].content).toContain(
      "Never use multiple # characters or ** bold markers.",
    );
    expect(body.messages.at(-1)).toEqual({
      role: "user",
      content: "How do I track my parcel?",
    });
  });

  test("requires a server-side Mistral API key", async () => {
    const request = jest.fn() as unknown as typeof fetch;
    const service = new AssistantService({ ...config, apiKey: "" }, request);

    await expect(
      service.chat([{ role: "user", content: "Hello" }], "customer"),
    ).rejects.toMatchObject({ status: 503 });
    expect(request).not.toHaveBeenCalled();
  });

  test("returns a friendly error when the free-tier rate limit is reached", async () => {
    const request = jest
      .fn()
      .mockResolvedValue(new Response("{}", { status: 429 })) as unknown as typeof fetch;
    const service = new AssistantService(config, request);

    await expect(
      service.chat([{ role: "user", content: "Hello" }], "customer"),
    ).rejects.toMatchObject({ status: 429 });
  });
});

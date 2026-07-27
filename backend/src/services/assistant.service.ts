import type { AssistantMessageDTO } from "../dtos/assistant.dto";
import { HttpException } from "../exceptions/http-exception";
import { AssistantContextService } from "./assistant-context.service";
import {
  MISTRAL_API_KEY,
  MISTRAL_API_URL,
  MISTRAL_MODEL,
} from "../configs/constant";
import type { AssistantChatResult, AssistantUser } from "../types/assistant.type";

type AssistantServiceConfig = {
  apiKey: string;
  apiUrl: string;
  model: string;
};

type MistralContentChunk = {
  type?: string;
  text?: string;
};

type MistralChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | MistralContentChunk[];
    };
  }>;
};

const SYSTEM_PROMPT = `You are the CargoNep AI Assistant for a logistics management and tracking platform in Nepal.
Help users with shipment booking, parcel tracking, delivery stages, payments, account navigation, and general logistics questions.
Keep answers concise, clear, friendly, and practical. If instructions depend on the CargoNep interface, describe the relevant dashboard section.
Format section headers with exactly one leading # followed by a space, and format list items with exactly one leading * followed by a space. Never use multiple # characters or ** bold markers.
Never invent a shipment status, payment status, delivery estimate, price, or account detail. You cannot directly access live customer records in this chat.
When a user asks about a specific shipment or payment, explain how to find it in Tracking, Shipments, or Payments and ask for a tracking ID only when useful.
If the request is unrelated to logistics or CargoNep support, politely redirect the conversation to those topics.`;

export class AssistantService {
  constructor(
    private readonly config: AssistantServiceConfig = {
      apiKey: MISTRAL_API_KEY,
      apiUrl: MISTRAL_API_URL,
      model: MISTRAL_MODEL,
    },
    private readonly request: typeof fetch = fetch,
    private readonly contextService = new AssistantContextService(),
  ) {}

  private extractMessage(payload: MistralChatResponse): string {
    const content = payload.choices?.[0]?.message?.content;

    if (typeof content === "string") return content.trim();
    if (Array.isArray(content)) {
      return content
        .filter((chunk) => chunk.type === "text" && typeof chunk.text === "string")
        .map((chunk) => chunk.text?.trim())
        .filter(Boolean)
        .join("\n")
        .trim();
    }

    return "";
  }

  async chat(
    messages: AssistantMessageDTO[],
    user: AssistantUser,
  ): Promise<AssistantChatResult> {
    const context = await this.contextService.build(user);

    if (!this.config.apiKey) {
      throw new HttpException(
        503,
        "AI assistant is not configured. Add MISTRAL_API_KEY to the backend environment.",
      );
    }

    let response: Response;
    try {
      response = await this.request(`${this.config.apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: "system",
              content: `${SYSTEM_PROMPT}\nCurrent signed-in role: ${user.role}.`,
            },
            ...messages,
          ],
          temperature: 0.35,
          max_tokens: 500,
        }),
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      const isTimeout =
        error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError");
      throw new HttpException(
        isTimeout ? 504 : 502,
        isTimeout
          ? "The AI assistant took too long to respond. Please try again."
          : "The AI assistant is temporarily unavailable. Please try again.",
      );
    }

    if (response.status === 429) {
      throw new HttpException(
        429,
        "The AI assistant free-tier limit was reached. Please wait and try again.",
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw new HttpException(503, "The Mistral API key is invalid or inactive.");
    }
    if (response.status === 402) {
      throw new HttpException(503, "The Mistral free-tier quota is unavailable.");
    }
    if (!response.ok) {
      throw new HttpException(502, "Mistral could not complete the request.");
    }

    let payload: MistralChatResponse;
    try {
      payload = (await response.json()) as MistralChatResponse;
    } catch {
      throw new HttpException(502, "Mistral returned an invalid response.");
    }

    const message = this.extractMessage(payload);
    if (!message) {
      throw new HttpException(502, "Mistral returned an empty response.");
    }

    return {
      message,
      model: this.config.model,
      cards: context.cards,
      actions: context.actions,
      suggestions: context.suggestions,
    };
  }
}

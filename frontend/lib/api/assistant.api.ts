import { authenticatedRequest } from "@/lib/api/api-client";

export type AssistantChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantChatResult = {
  message: string;
  model: string;
  cards: AssistantCard[];
  actions: AssistantAction[];
  suggestions: AssistantSuggestion[];
};

export type AssistantAction = {
  label: string;
  href: string;
};

export type AssistantCard = {
  title: string;
  description: string;
  tone?: "default" | "success" | "warning";
  href?: string;
};

export type AssistantSuggestion = {
  label: string;
  prompt: string;
};

export async function sendAssistantMessage(
  token: string,
  messages: AssistantChatMessage[],
): Promise<AssistantChatResult> {
  return authenticatedRequest<AssistantChatResult>(
    "/api/v1/assistant/chat",
    token,
    {
      method: "POST",
      body: JSON.stringify({ messages }),
    },
  );
}

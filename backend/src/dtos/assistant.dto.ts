import { z } from "zod";

export const AssistantMessageDTO = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1, "Message cannot be empty").max(2000),
});

export const AssistantChatDTO = z
  .object({
    messages: z.array(AssistantMessageDTO).min(1).max(12),
  })
  .refine(
    ({ messages }) => messages[messages.length - 1]?.role === "user",
    "The last message must be from the user",
  );

export type AssistantMessageDTO = z.infer<typeof AssistantMessageDTO>;
export type AssistantChatDTO = z.infer<typeof AssistantChatDTO>;

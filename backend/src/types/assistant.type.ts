export type AssistantAction = {
  label: string;
  href: string;
};

export type AssistantCardTone = "default" | "success" | "warning";

export type AssistantCard = {
  title: string;
  description: string;
  tone?: AssistantCardTone;
  href?: string;
};

export type AssistantSuggestion = {
  label: string;
  prompt: string;
};

export type AssistantChatResult = {
  message: string;
  model: string;
  cards: AssistantCard[];
  actions: AssistantAction[];
  suggestions: AssistantSuggestion[];
};

export type AssistantUser = {
  id: string;
  role: string;
};

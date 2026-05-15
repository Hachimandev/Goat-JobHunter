import { IBackendRes } from "@/types/api";

export type TranslateMessage = {
  sourceText: string;
  translatedText: string;
  targetLang: string;
};

export type TranslateMessageRequest = {
  content: string;
  targetLang: string;
};

export type TranslateMessageResponse = IBackendRes<TranslateMessage>;

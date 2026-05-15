import { api } from "@/services/api";
import {
  TranslateMessageRequest,
  TranslateMessageResponse,
} from "@/services/ai/conversationType";

export const conversationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    translateMessage: builder.mutation<
      TranslateMessageResponse,
      TranslateMessageRequest
    >({
      query: ({ content, targetLang }) => ({
        url: "/ai/messages/translate",
        method: "GET",
        params: { content, targetLang },
      }),
    }),
  }),
});

export const { useTranslateMessageMutation } = conversationApi;

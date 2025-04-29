import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

interface ChatState {
    messages: ChatCompletionMessageParam[];
    addMessage: (message: ChatCompletionMessageParam) => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set) => ({
            messages: [],
            addMessage: (message) =>
                set((state) => ({
                    messages: [...state.messages, message],
                })),
        }),
        {
            name: "chat-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

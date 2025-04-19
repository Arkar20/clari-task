import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Message {
    id: string;
    title: string;
    role: "user" | "tool" | "assistant";
}

interface ChatState {
    messages: Message[];
    addMessage: (message: Message) => void;
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
            name: "chat-storage", // unique name
            storage: createJSONStorage(() => localStorage),
        }
    )
);

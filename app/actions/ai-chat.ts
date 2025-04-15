"use server";

import { useBoardStore } from "@/store/useBoardStore";

export async function handleAIChat(message: string) {
    try {
        console.log("Hello from server action!");
        console.log("Message received:", message);

        // Get the Zustand store
        const store = useBoardStore.getState();

        // Add user message to store
        store.addAIMessage({
            id: Date.now().toString(),
            text: message,
            isUser: true,
        });

        // Simulate some processing time
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Add AI response to store
        const aiResponse = {
            id: (Date.now() + 1).toString(),
            text: "I'm an AI assistant. How can I help you with your board?",
            isUser: false,
        };

        store.addAIMessage(aiResponse);

        return {
            success: true,
            response: aiResponse.text,
        };
    } catch (error) {
        console.error("Error in handleAIChat:", error);
        return {
            success: false,
            error: "Failed to process message",
        };
    }
}

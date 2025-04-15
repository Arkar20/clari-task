"use server";

import { useBoardStore } from "@/store/useBoardStore";

export async function handleAIChat(message: string) {
    try {
        console.log("AI Chat Server Action Called");

        // Get the Zustand store
        const store = useBoardStore.getState();

        // Log the current board state
        console.log("Current Board State:");
        console.log("Columns:", store.columns);
        console.log(
            "Total Tasks:",
            store.columns.reduce((acc, col) => acc + col.tasks.length, 0)
        );

        // Log details of each column and its tasks
        store.columns.forEach((column, index) => {
            console.log(`\nColumn ${index + 1}: ${column.title}`);
            console.log(`Task Count: ${column.tasks.length}`);
            console.log(
                "Tasks:",
                column.tasks.map((task) => ({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                }))
            );
        });

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

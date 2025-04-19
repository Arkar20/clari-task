"use server";
import { handleAiCall } from "./openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
type ResponseType = {
    success: boolean;
    message: string;
    error?: string;
};
export async function handleAIChat(
    messages: ChatCompletionMessageParam[]
): Promise<ResponseType> {
    try {
        // Call OpenAI API
        const response = await handleAiCall(messages);

        return response;
    } catch (error) {
        console.error("Error in handleAIChat:", error);
        return {
            success: false,
            error: "Failed to process message",
            message: "Error",
        };
    }
}

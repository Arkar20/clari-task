"use server";
import { handleAiCall } from "./openai";
import { AIResponse } from "../actions/openai";

export async function handleAIChat(messages: any): Promise<AIResponse> {
    try {
        // Call OpenAI API
        const response = await handleAiCall(messages);

        return response;
    } catch (error) {
        return {
            success: false,
            error: "Error",
        };
    }
}

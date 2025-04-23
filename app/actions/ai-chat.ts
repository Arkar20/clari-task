"use server";
import { handleAiCall } from "./openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { AIResponse } from "../actions/openai";

export async function handleAIChat(
    messages: ChatCompletionMessageParam[]
): Promise<AIResponse> {
    try {
        // Call OpenAI API
        const response = await handleAiCall(messages);

        return response;
    } catch (error) {
        return {
            type: "message",
            success: false,
            message: "Error",
        };
    }
}

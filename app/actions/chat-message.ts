"use server";

import { prisma } from "@/lib/prisma";
import { handleAIChat } from "./ai-chat";
import { AIResponse } from "./openai";
import { prepareMessages } from "@/lib/ai";
import { handleTool } from "./openai/handler";
import { ToolName } from "./openai/tool";
import { revalidatePath } from "next/cache";

export const createAIMessage = async (payload: any) => {
    const response = await addMessage(payload);

    const result = await handleToolCall(response);

    revalidatePath("/");

    return result;
};

export async function addMessage(payload: any): Promise<AIResponse> {
    try {
        const count = await prisma.message.count();

        if (count > 10) {
            await prisma.message.deleteMany();
        }

        const newMessage = await prisma.message.create({
            data: {
                data: payload,
            },
        });

        if (!newMessage) {
            throw new Error("Message Not Created");
        }

        // handle AI Call
        const messages = await prisma.message.findMany({
            select: {
                data: true,
            },
        });

        // fetch all the messages
        const response = await handleAIChat(
            prepareMessages(messages.map((message) => message.data))
        );

        return response;
    } catch (error) {
        console.error("Failed to add message:", error);
        return { success: false, message: "Failed to add message" };
    }
}

const handleToolCall = async (response: AIResponse): Promise<AIResponse> => {
    if (response.success && response.type === "message") {
        const message = await addMessage({
            role: "assistant",
            content: response.message,
        });

        if (message)
            return { type: "message", success: true, message: "success" };

        return { success: false, message: "error" };
    }

    // tool calls
    if (response.success && response.type === "tool_call") {
        const { toolCalls, message } = response;

        const toolMessage = await addMessage(message);

        if (!toolMessage) return { success: false, message: "error" };

        for (const toolCall of toolCalls) {
            const args = toolCall.function.arguments
                ? JSON.parse(toolCall.function.arguments)
                : undefined;

            const results = await handleTool(
                toolCall.function.name as ToolName,
                args
            );

            console.log("results", results);

            if (results) {
                const response = await addMessage({
                    role: "tool",
                    content: JSON.stringify(results),
                    tool_call_id: toolCall.id,
                });

                if (response) {
                    await handleToolCall(response);
                }
            }
        }
    }

    return { type: "message", success: true, message: "Success" };
};

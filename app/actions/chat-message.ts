"use server";

import { prisma } from "@/lib/prisma";
import { handleAIChat } from "./ai-chat";
import { AIResponse } from "./openai";
import { revalidatePath } from "next/cache";

export async function addMessage(payload: any): Promise<AIResponse> {
    try {
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
        const aiRes = await handleAIChat(
            messages.map((message) => message.data)
        );

        revalidatePath("/");

        return aiRes;
    } catch (error) {
        console.error("Failed to add message:", error);
        return { success: false, error: "Failed to add message" };
    }
}

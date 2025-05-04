"use server";

import { prisma } from "@/lib/prisma";
import { handleAIChat } from "./ai-chat";
import { AIResponse } from "./openai";
import { revalidatePath } from "next/cache";
import { prepareMessages } from "@/lib/ai";

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
        const aiRes = await handleAIChat(
            prepareMessages(messages.map((message) => message.data))
        );

        return aiRes;
    } catch (error) {
        console.error("Failed to add message:", error);
        return { success: false, message: "Failed to add message" };
    }
}

"use server";

import { prisma } from "@/lib/prisma";

export async function addMessage(chatId: string, payload: any) {
    try {
        const newMessage = await prisma.message.create({
            data: {
                chatId,
                data: payload,
            },
        });

        // handle AI Call

        // fetch all the messages

        // pass the payload to AI

        // save return messages

        //return to frontend

        return { success: true, message: newMessage };
    } catch (error) {
        console.error("Failed to add message:", error);
        return { success: false, error: "Failed to add message" };
    }
}

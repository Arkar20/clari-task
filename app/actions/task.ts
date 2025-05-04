"use server";

import { prisma } from "@/lib/prisma"; // adjust the path to your prisma instance
import { revalidatePath } from "next/cache"; // optional, for ISR

type CreateTaskInput = {
    title: string;
    description?: string;
    columnId: string;
    sort?: number;
};

export async function createTask(data: CreateTaskInput) {
    try {
        const task = await prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                columnId: data.columnId,
                sort: data.sort ?? null,
            },
        });

        revalidatePath("/");

        return { success: true, task };
    } catch (error) {
        console.error("Error creating task:", error);
        return { success: false, error: "Failed to create task" };
    }
}

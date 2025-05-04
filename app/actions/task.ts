"use server";

import { prisma } from "@/lib/prisma"; // adjust the path to your prisma instance
import { revalidatePath } from "next/cache"; // optional, for ISR

type CreateTaskInput = {
    title: string;
    description?: string;
    columnId: string;
};

export async function createTask(columnId: string, data: CreateTaskInput) {
    try {
        const maxSort = await prisma.task.aggregate({
            where: {
                columnId,
            },
            _max: {
                sort: true,
            },
        });

        const nextSort = (maxSort._max.sort ?? 0) + 1;

        const task = await prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                columnId: data.columnId,
                sort: nextSort,
            },
        });

        revalidatePath("/");

        return { success: true, task };
    } catch (error) {
        console.error("Error creating task:", error);
        return { success: false, error: "Failed to create task" };
    }
}

export async function swapTaskSort(
    selected: {
        id: string;
        colId: string;
    },
    target: {
        id: string;
        colId: string;
    }
) {
    try {
        if (!selected.colId || !target.colId) return;

        // Get current sort values for both boards
        const [selectedTask, targetTask] = await prisma.$transaction([
            prisma.task.findFirstOrThrow({
                where: { id: selected.id },
            }),
            prisma.task.findFirstOrThrow({ where: { id: target.id } }),
        ]);

        // Swap sort values
        await prisma.$transaction([
            prisma.task.update({
                where: { id: selectedTask.id },
                data: { sort: targetTask.sort, columnId: targetTask.columnId },
            }),

            prisma.task.update({
                where: { id: targetTask.id },
                data: {
                    sort: selectedTask.sort,
                    columnId: selectedTask.columnId,
                },
            }),
        ]);

        // revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error swapping board sort:", error);
        return { success: false, error: "Failed to swap board sort order" };
    }
}

export async function swapTaskToEmptyColumn(
    selected: {
        id: string;
        colId: string;
    },
    targetColId: string
) {
    try {
        // Get current sort values for both boards
        const targetTask = await prisma.task.findFirstOrThrow({
            where: { id: selected.id },
        });

        const maxSort = await prisma.board.aggregate({
            where: {
                id: targetColId,
            },
            _max: {
                sort: true,
            },
        });

        const nextSort = (maxSort._max.sort ?? 0) + 1;

        // Swap sort values
        const task = await prisma.task.update({
            where: { id: targetTask.id },
            data: {
                sort: nextSort,
                columnId: targetColId,
            },
        });

        console.log(task);

        // revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error swapping board sort:", error);
        return { success: false, error: "Failed to swap board sort order" };
    }
}

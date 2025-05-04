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
    selected: { id: string; colId: string },
    target: { id: string; colId: string }
) {
    try {
        if (!selected.colId || !target.colId) return;

        const [selectedTask, targetTask] = await prisma.$transaction([
            prisma.task.findFirstOrThrow({ where: { id: selected.id } }),
            prisma.task.findFirstOrThrow({ where: { id: target.id } }),
        ]);

        const isSameColumn = selected.colId === target.colId;

        if (isSameColumn) {
            const tasks = await prisma.task.findMany({
                where: { columnId: selected.colId },
                orderBy: { sort: "asc" },
            });

            const updatedTasks = tasks
                .filter((task) => task.id !== selectedTask.id)
                .reduce((acc, task, index) => {
                    if (
                        task.id === targetTask.id &&
                        selectedTask.sort < targetTask.sort
                    ) {
                        acc.push({ ...selectedTask, sort: index });
                        acc.push({ ...task, sort: index + 1 });
                    } else if (task.id === targetTask.id) {
                        acc.push({ ...selectedTask, sort: index });
                        acc.push({ ...task, sort: index + 1 });
                    } else {
                        acc.push({ ...task, sort: acc.length });
                    }
                    return acc;
                }, [] as any[]);

            await prisma.$transaction(
                updatedTasks.map((task) =>
                    prisma.task.update({
                        where: { id: task.id },
                        data: { sort: task.sort },
                    })
                )
            );
        } else {
            await prisma.$transaction([
                // Step 1: Make space in target column
                prisma.task.updateMany({
                    where: {
                        columnId: target.colId,
                        sort: { gte: targetTask.sort as number },
                    },
                    data: { sort: { increment: 1 } },
                }),

                // Step 2: Move task to target column
                prisma.task.update({
                    where: { id: selectedTask.id },
                    data: {
                        columnId: target.colId,
                        sort: targetTask.sort,
                    },
                }),

                // Step 3: Close gap in original column
                prisma.task.updateMany({
                    where: {
                        columnId: selected.colId,
                        sort: { gt: selectedTask.sort as number },
                    },
                    data: { sort: { decrement: 1 } },
                }),
            ]);
        }

        return { success: true };
    } catch (error) {
        console.error("Error swapping task sort:", error);
        return { success: false, error: "Failed to reorder tasks" };
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

        const maxSort = await prisma.task.aggregate({
            where: {
                columnId: targetColId,
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

        // revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error swapping board sort:", error);
        return { success: false, error: "Failed to swap board sort order" };
    }
}

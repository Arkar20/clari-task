"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CreateBoardInput = {
    title: string;
    sort?: number;
};

export async function createBoard(data: CreateBoardInput) {
    try {
        const maxSort = await prisma.board.aggregate({
            _max: {
                sort: true,
            },
        });

        const nextSort = (maxSort._max.sort ?? 0) + 1;

        const board = await prisma.board.create({
            data: {
                title: data.title,
                sort: nextSort,
            },
        });

        return { success: true, board };
    } catch (error) {
        console.error("Error creating board:", error);
        return { success: false, error: "Failed to create board" };
    }
}

export async function swapBoardSort(
    selectedId: string | null,
    targetId: string | null
) {
    try {
        if (!selectedId || !targetId) return;
        // Get current sort values for both boards
        const [selectedBoard, targetBoard] = await prisma.$transaction([
            prisma.board.findUniqueOrThrow({ where: { id: selectedId } }),
            prisma.board.findUniqueOrThrow({ where: { id: targetId } }),
        ]);

        // Swap sort values
        await prisma.$transaction([
            prisma.board.update({
                where: { id: selectedId },
                data: { sort: targetBoard.sort },
            }),
            prisma.board.update({
                where: { id: targetId },
                data: { sort: selectedBoard.sort },
            }),
        ]);

        // revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error swapping board sort:", error);
        return { success: false, error: "Failed to swap board sort order" };
    }
}

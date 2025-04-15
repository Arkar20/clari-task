import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { title, description, boardId } = await request.json();

        const task = await prisma.task.create({
            data: {
                title,
                description,
                boardId,
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create task" },
            { status: 500 }
        );
    }
}

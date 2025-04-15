import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const boards = await prisma.board.findMany({
            include: {
                tasks: true,
            },
        });

        return NextResponse.json(boards);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch boards" },
            { status: 500 }
        );
    }
}

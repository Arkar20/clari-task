export const dynamic = "force-dynamic";

import AIChatbot from "@/components/ai-chatbot";
import Board from "@/components/board";
import { ThemeToggle } from "@/components/theme-toggle";
import { prisma } from "@/lib/prisma";

export default async function Home() {
    const messages = await prisma.message.findMany({
        select: {
            data: true,
        },
    });

    const boards = await prisma.board.findMany({
        orderBy: {
            sort: "asc",
        },
        include: {
            tasks: {
                orderBy: {
                    sort: "asc",
                },
            },
        },
    });

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between">
                    <h1 className="mb-8 text-4xl font-bold text-foreground">
                        Task Board
                    </h1>
                    <ThemeToggle />
                </div>
                <Board boards={boards} />

                <AIChatbot messages={messages.map((res) => res.data)} />
            </div>
        </div>
    );
}

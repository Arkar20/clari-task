import Board from "@/components/board";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between">
                    <h1 className="mb-8 text-4xl font-bold text-foreground">
                        Task Board
                    </h1>
                    <ThemeToggle />
                </div>
                <Board />
            </div>
        </div>
    );
}

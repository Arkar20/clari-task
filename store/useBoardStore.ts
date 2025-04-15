import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Task {
    id: string;
    title: string;
    description?: string;
}

interface Column {
    id: string;
    title: string;
    tasks: Task[];
}

interface Message {
    id: string;
    text: string;
    isUser: boolean;
}

interface BoardState {
    columns: Column[];
    addColumn: (title: string) => void;
    updateColumns: (columns: Column[]) => void;
    // AI Chat state
    aiMessages: Message[];
    addAIMessage: (message: Message) => void;
}

const initialColumns: Column[] = [
    {
        id: "todo",
        title: "To Do",
        tasks: [
            {
                id: "task-1",
                title: "Research competitors",
                description: "Analyze key competitors in the market",
            },
            {
                id: "task-2",
                title: "Design mockups",
                description: "Create initial design mockups for the dashboard",
            },
        ],
    },
    {
        id: "in-progress",
        title: "In Progress",
        tasks: [
            {
                id: "task-3",
                title: "Implement authentication",
                description: "Set up user authentication system",
            },
            {
                id: "task-4",
                title: "Create API endpoints",
                description: "Design and implement RESTful API endpoints",
            },
        ],
    },
    {
        id: "done",
        title: "Done",
        tasks: [
            {
                id: "task-5",
                title: "Project setup",
                description:
                    "Initialize project and set up development environment",
            },
            {
                id: "task-6",
                title: "Initial planning",
                description: "Define project scope and create roadmap",
            },
        ],
    },
];

export const useBoardStore = create<BoardState>()(
    persist(
        (set) => ({
            columns: initialColumns,
            addColumn: (title: string) =>
                set((state) => ({
                    columns: [
                        ...state.columns,
                        {
                            id: `column-${Date.now()}`,
                            title,
                            tasks: [],
                        },
                    ],
                })),
            updateColumns: (columns: Column[]) => set({ columns }),
            // AI Chat state
            aiMessages: [],
            addAIMessage: (message: Message) =>
                set((state) => ({
                    aiMessages: [...state.aiMessages, message],
                })),
        }),
        {
            name: "board-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

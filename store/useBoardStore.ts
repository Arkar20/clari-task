import { Prisma } from "@/lib/generated/prisma";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Column = Prisma.BoardGetPayload<{ include: { tasks: true } }>;

export type Task = Prisma.TaskGetPayload<{}>;
interface BoardState {
    columns: Column[];
    addColumn: (title: string) => void;
    updateColumns: (columns: Column[]) => void;
    addTask: (columnId: string, task: Task) => void;
}

export const useBoardStore = create<BoardState>()(
    persist(
        (set) => ({
            columns: [],
            addColumn: async (title: string) => {
                set((state) => ({
                    columns: [
                        ...state.columns,
                        {
                            id: new Date().toISOString(),
                            title,
                            sort: 1,
                            updatedAt: new Date(),
                            createdAt: new Date(),
                            tasks: [],
                        },
                    ],
                }));
            },
            updateColumns: (columns: Column[]) => set({ columns }),
            addTask: (columnId: string, task: Task) =>
                set((state) => ({
                    columns: state.columns.map((column) =>
                        column.id === columnId
                            ? { ...column, tasks: [...column.tasks, task] }
                            : column
                    ),
                })),
        }),
        {
            name: "board-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

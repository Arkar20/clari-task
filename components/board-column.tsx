"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Task from "./task";
import { PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useState } from "react";
import { useBoardStore } from "@/store/useBoardStore";
import { generateUUID } from "@/lib/utils";

interface Task {
    id: string;
    title: string;
    description?: string;
    boardId: string;
}

interface Board {
    id: string;
    title: string;
    tasks: Task[];
}

interface BoardColumnProps {
    board: Board;
    activeTask: Task | null;
}

export function BoardColumn({ board, activeTask }: BoardColumnProps) {
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");

    const { addTask, columns } = useBoardStore();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: board.id,
        data: {
            type: "Board",
            board,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    async function handleAddTask() {
        if (!newTaskTitle.trim()) return;

        try {
            addTask(board.id, {
                id: generateUUID(),
                title: newTaskTitle,
                description: newTaskDescription,
            });

            setNewTaskTitle("");
            setNewTaskDescription("");
            document.getElementById("close-dialog")?.click();
        } catch (error) {
            console.error("Error creating task:", error);
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex h-[600px] w-[280px] flex-col gap-4 rounded-lg border bg-background p-4"
        >
            <h2 className="text-lg font-semibold">{board.title}</h2>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                {board.tasks.map((task) => (
                    <Task key={task.id} task={task} />
                ))}
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Add Task
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 pt-4">
                        <Input
                            placeholder="Task title"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                        <Input
                            placeholder="Task description"
                            value={newTaskDescription}
                            onChange={(e) =>
                                setNewTaskDescription(e.target.value)
                            }
                        />
                        <DialogFooter className="sm:justify-start">
                            <DialogClose asChild>
                                <Button type="button" onClick={handleAddTask}>
                                    Add
                                </Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    id="close-dialog"
                                >
                                    Close
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

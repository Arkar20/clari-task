"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column as ColumnType, Task } from "@/store/useBoardStore";
import TaskCard from "./task-card";
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

interface ColumnProps {
    column: ColumnType;
}

export default function Column({ column }: ColumnProps) {
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex h-full w-[300px] flex-col gap-4 rounded-lg border bg-card p-4"
        >
            <h2 className="text-lg font-semibold">{column.title}</h2>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                {column.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Task
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <Input
                            placeholder="Task title"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                        <Input
                            placeholder="Task description (optional)"
                            value={newTaskDescription}
                            onChange={(e) =>
                                setNewTaskDescription(e.target.value)
                            }
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (newTaskTitle.trim()) {
                                        const newTask: Task = {
                                            id: `task-${Date.now()}`,
                                            title: newTaskTitle.trim(),
                                            description:
                                                newTaskDescription.trim() ||
                                                undefined,
                                        };
                                        column.tasks.push(newTask);
                                        setNewTaskTitle("");
                                        setNewTaskDescription("");
                                    }
                                }}
                            >
                                Add
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

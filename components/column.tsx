"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "./ui/card";
import TaskCard from "./task-card";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { Column as ColumnType, Task as TaskType } from "@/types";
import Task from "./task";

interface Task {
    id: string;
    title: string;
    description?: string;
}

interface ColumnProps {
    column: ColumnType;
    activeTask: TaskType | null;
}

export default function Column({ column, activeTask }: ColumnProps) {
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
    };

    function handleAddTask() {
        if (!newTaskTitle.trim()) return;

        const newTask: Task = {
            id: `task-${Date.now()}`,
            title: newTaskTitle,
            description: newTaskDescription,
        };

        column.tasks.push(newTask);
        setNewTaskTitle("");
        setNewTaskDescription("");

        document.getElementById("close-dialog")?.click();
    }

    if (!mounted) return null;

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`flex h-[600px] w-[280px] flex-col bg-card p-4 ${
                isDragging ? "opacity-50" : ""
            }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="mb-4 text-lg font-semibold text-card-foreground"
            >
                {column.title}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">
                <AnimatePresence>
                    {column.tasks.map((task: TaskType) => (
                        <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Task
                                key={task.id}
                                task={task}
                                activeTask={activeTask}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="mt-4 w-full border-dashed hover:border-primary hover:bg-primary/10"
                    >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Add Task
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Input
                            placeholder="Task title"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                        <Textarea
                            placeholder="Task description (optional)"
                            value={newTaskDescription}
                            onChange={(e) =>
                                setNewTaskDescription(e.target.value)
                            }
                        />
                        <Button onClick={handleAddTask} className="w-full">
                            Add Task
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

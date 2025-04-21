"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Column as ColumnType,
    Task,
    useBoardStore,
} from "@/store/useBoardStore";
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
import { useState, memo } from "react";

interface ColumnProps {
    columnId: string;
    overId?: string | null;
    activeId?: string | null;
}

const Column = memo(function Column({
    columnId,
    overId,
    activeId,
}: ColumnProps) {
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");

    const { columns, addTask } = useBoardStore();

    const column = columns.find((col) => col.id === columnId);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: columnId,
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

    const handleAddTask = () => {
        if (newTaskTitle.trim()) {
            const newTask: Task = {
                id: `task-${Date.now()}`,
                title: newTaskTitle.trim(),
                description: newTaskDescription.trim() || undefined,
            };

            addTask(column.id, newTask);

            setNewTaskTitle("");
            setNewTaskDescription("");
        }
    };

    if (!column) {
        return null;
    }

    const isOverColumn = overId === column.id;
    const isActiveColumn = activeId === column.id;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`flex h-full w-[300px] flex-col gap-4 rounded-lg border bg-card p-4 ${
                isOverColumn && !isActiveColumn ? "ring-2 ring-primary" : ""
            }`}
        >
            <h2 className="text-lg font-semibold">{column.title}</h2>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                {column.tasks.map((task: Task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        overId={overId}
                        activeId={activeId}
                    />
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
                            <Button variant="outline" onClick={handleAddTask}>
                                Add
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
});

export default Column;

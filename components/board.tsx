"use client";

import { useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import Column from "./column";
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
import { AnimatePresence, motion } from "framer-motion";
import { useBoardStore } from "@/store/useBoardStore";
import AIChatbot from "./ai-chatbot";

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

export default function Board() {
    const { columns, addColumn, updateColumns } = useBoardStore();
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [newColumnTitle, setNewColumnTitle] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    function handleDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
        }
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === "Task";
        const isOverATask = over.data.current?.type === "Task";

        if (!isActiveATask) return;

        // Dropping a Task over another Task
        if (isActiveATask && isOverATask) {
            const updatedColumns = [...columns];
            const activeIndex = updatedColumns.findIndex((col: Column) =>
                col.tasks.find((t: Task) => t.id === activeId)
            );
            const overIndex = updatedColumns.findIndex((col: Column) =>
                col.tasks.find((t: Task) => t.id === overId)
            );

            if (activeIndex === -1 || overIndex === -1) return;

            const activeTask = updatedColumns[activeIndex].tasks.find(
                (t: Task) => t.id === activeId
            );
            const overTask = updatedColumns[overIndex].tasks.find(
                (t: Task) => t.id === overId
            );

            if (!activeTask || !overTask) return;

            updatedColumns.forEach((col: Column) => {
                if (col.id === updatedColumns[activeIndex].id) {
                    col.tasks = col.tasks.filter(
                        (t: Task) => t.id !== activeId
                    );
                }
                if (col.id === updatedColumns[overIndex].id) {
                    const overTaskIndex = col.tasks.findIndex(
                        (t: Task) => t.id === overId
                    );
                    col.tasks.splice(overTaskIndex, 0, activeTask);
                }
            });

            updateColumns(updatedColumns);
        }

        // Dropping a Task over a Column
        const isOverAColumn = over.data.current?.type === "Column";
        if (isActiveATask && isOverAColumn) {
            const updatedColumns = [...columns];
            const activeIndex = updatedColumns.findIndex((col: Column) =>
                col.tasks.find((t: Task) => t.id === activeId)
            );

            if (activeIndex === -1) return;

            const activeTask = updatedColumns[activeIndex].tasks.find(
                (t: Task) => t.id === activeId
            );

            if (!activeTask) return;

            updatedColumns.forEach((col: Column) => {
                if (col.id === updatedColumns[activeIndex].id) {
                    col.tasks = col.tasks.filter(
                        (t: Task) => t.id !== activeId
                    );
                }
                if (col.id === overId) {
                    col.tasks.push(activeTask);
                }
            });

            updateColumns(updatedColumns);
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveTask(null);
    }

    function handleAddColumn() {
        if (!newColumnTitle.trim()) return;
        addColumn(newColumnTitle);
        setNewColumnTitle("");
        document.getElementById("close-dialog")?.click();
    }

    return (
        <>
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-screen w-full gap-4 overflow-x-auto pb-4">
                    <AnimatePresence>
                        <SortableContext
                            items={columns.map((col: Column) => col.id)}
                        >
                            {columns.map((column: Column) => (
                                <motion.div
                                    key={column.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Column
                                        column={column}
                                        activeTask={activeTask}
                                    />
                                </motion.div>
                            ))}
                        </SortableContext>
                    </AnimatePresence>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex h-[600px] w-[280px] items-center justify-center border-2 border-dashed hover:border-primary hover:bg-primary/10"
                            >
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Add Column
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Column</DialogTitle>
                            </DialogHeader>
                            <div className="flex gap-4 pt-4">
                                <Input
                                    placeholder="Column title"
                                    value={newColumnTitle}
                                    onChange={(e) =>
                                        setNewColumnTitle(e.target.value)
                                    }
                                />
                                <DialogFooter className="sm:justify-start">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            onClick={handleAddColumn}
                                        >
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
            </DndContext>
            <AIChatbot />
        </>
    );
}

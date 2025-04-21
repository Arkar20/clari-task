"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task as TaskType } from "@/types";
import { useState, useEffect } from "react";

interface TaskProps {
    task: TaskType;
}

export default function Task({ task }: TaskProps) {
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
        id: task.id,
        data: {
            type: "Task",
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (!mounted) return null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded-lg bg-card p-4 ${
                isDragging ? "opacity-50" : ""
            }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="text-card-foreground"
            >
                <h3 className="font-semibold">{task.title}</h3>
                {task.description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        {task.description}
                    </p>
                )}
            </div>
        </div>
    );
}

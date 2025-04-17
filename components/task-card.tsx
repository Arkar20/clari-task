"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/store/useBoardStore";
import { memo } from "react";

interface TaskCardProps {
    task: Task;
    overId?: string | null;
    activeId?: string | null;
}

const TaskCard = memo(function TaskCard({
    task,
    overId,
    activeId,
}: TaskCardProps) {
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
        opacity: isDragging ? 0.5 : 1,
    };

    const isOverTask = overId === task.id;
    const isActiveTask = activeId === task.id;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative rounded-lg border bg-card p-4 ${
                isOverTask && !isActiveTask
                    ? "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-b before:from-primary/20 before:to-transparent before:content-['']"
                    : ""
            }`}
        >
            <h3 className="font-medium">{task.title}</h3>
            {task.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                    {task.description}
                </p>
            )}
        </div>
    );
});

export default TaskCard;

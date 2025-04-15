"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "./ui/card";

interface Task {
  id: string;
  title: string;
  description?: string;
}

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export default function TaskCard({ task, isOverlay }: TaskCardProps) {
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

  const cardContent = (
    <div className="space-y-2 p-4">
      <h3 className="font-medium text-card-foreground">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-muted-foreground">{task.description}</p>
      )}
    </div>
  );

  if (isOverlay) {
    return (
      <Card className="border-primary bg-primary/5 shadow-lg">
        {cardContent}
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab border-transparent bg-card shadow-md transition-all hover:border-primary hover:bg-primary/5"
    >
      {cardContent}
    </Card>
  );
}
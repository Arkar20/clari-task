"use client";

import { useState, useCallback, useMemo, useEffect, act } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import {
    Column as ColumnType,
    Task,
    useBoardStore,
} from "@/store/useBoardStore";
import CreateBoard from "./create-board";
import Column from "./column";
import { swapBoardSort } from "@/app/actions/board";
import { swapTaskSort, swapTaskToEmptyColumn } from "@/app/actions/task";

export default function Board({ boards }: { boards: ColumnType[] }) {
    const { columns, updateColumns } = useBoardStore();

    useEffect(() => {
        updateColumns(boards);
    }, [boards]);

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeColumn, setActiveColumn] = useState<{
        id: string;
        title: string;
    } | null>(null);

    const [overId, setOverId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const columnIds = useMemo(() => columns.map((col) => col.id), [columns]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
        }
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
        }
    }, []);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        setOverId(overId.toString());
    }, []);

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over) {
                setOverId(null);
                setActiveTask(null);
                setActiveColumn(null);
                return;
            }

            const activeId = active.id;
            const overId = over.id;

            if (activeId === overId) {
                setOverId(null);
                setActiveTask(null);
                setActiveColumn(null);
                return;
            }

            const isActiveATask = active.data.current?.type === "Task";
            const isOverATask = over.data.current?.type === "Task";
            const isActiveAColumn = active.data.current?.type === "Column";
            const isOverAColumn = over.data.current?.type === "Column";

            if (isActiveAColumn && isOverAColumn) {
                const activeColumnIndex = columns.findIndex(
                    (col) => col.id === activeId
                );

                const overColumnIndex = columns.findIndex(
                    (col) => col.id === overId
                );

                if (activeColumnIndex !== -1 && overColumnIndex !== -1) {
                    const newColumns = arrayMove(
                        columns,
                        activeColumnIndex,
                        overColumnIndex
                    );
                    updateColumns(newColumns);
                }

                await swapBoardSort(
                    active.data.current?.column.id,
                    over.data.current?.column.id
                );
            } else if (isActiveATask) {
                const activeColumn = columns.find((col) =>
                    col.tasks.some((task) => task.id === activeId)
                );
                const overColumn = columns.find((col) =>
                    isOverATask
                        ? col.tasks.some((task) => task.id === overId)
                        : col.id === overId
                );

                if (!activeColumn || !overColumn) return;

                const activeTaskIndex = activeColumn.tasks.findIndex(
                    (task) => task.id === activeId
                );
                const activeTask = activeColumn.tasks[activeTaskIndex];

                if (isOverATask) {
                    // Moving task within the same column
                    if (activeColumn.id === overColumn.id) {
                        const overTaskIndex = overColumn.tasks.findIndex(
                            (task) => task.id === overId
                        );

                        const newTasks = arrayMove(
                            activeColumn.tasks,
                            activeTaskIndex,
                            overTaskIndex
                        );

                        const newColumns = columns.map((col) =>
                            col.id === activeColumn.id
                                ? { ...col, tasks: newTasks }
                                : col
                        );
                        updateColumns(newColumns);
                    } else {
                        // Moving task to a different column
                        const overTaskIndex = overColumn.tasks.findIndex(
                            (task) => task.id === overId
                        );
                        const newActiveTasks = activeColumn.tasks.filter(
                            (task) => task.id !== activeId
                        );
                        const newOverTasks = [
                            ...overColumn.tasks.slice(0, overTaskIndex),
                            activeTask,
                            ...overColumn.tasks.slice(overTaskIndex),
                        ];
                        const newColumns = columns.map((col) => {
                            if (col.id === activeColumn.id) {
                                return { ...col, tasks: newActiveTasks };
                            }
                            if (col.id === overColumn.id) {
                                return { ...col, tasks: newOverTasks };
                            }
                            return col;
                        });
                        updateColumns(newColumns);
                    }
                } else {
                    // Moving task to a column (not over a specific task)
                    if (activeColumn.id === overColumn.id) {
                        // If dropping in the same column, move to the end
                        const newTasks = [
                            ...activeColumn.tasks.filter(
                                (task) => task.id !== activeId
                            ),
                            activeTask,
                        ];
                        const newColumns = columns.map((col) =>
                            col.id === activeColumn.id
                                ? { ...col, tasks: newTasks }
                                : col
                        );
                        updateColumns(newColumns);
                    } else {
                        // Moving to a different column
                        const newActiveTasks = activeColumn.tasks.filter(
                            (task) => task.id !== activeId
                        );
                        const newOverTasks = [...overColumn.tasks, activeTask];
                        const newColumns = columns.map((col) => {
                            if (col.id === activeColumn.id) {
                                return { ...col, tasks: newActiveTasks };
                            }
                            if (col.id === overColumn.id) {
                                return { ...col, tasks: newOverTasks };
                            }
                            return col;
                        });
                        updateColumns(newColumns);
                    }
                }

                console.log(active.data.current, over.data.current);

                if (over.data.current?.type == "Column") {
                    await swapTaskToEmptyColumn(
                        {
                            id: active.data.current?.task?.id,
                            colId: active.data.current?.task?.columnId,
                        },
                        over.data.current?.column.id
                    );
                } else {
                    await swapTaskSort(
                        {
                            id: active.data.current?.task?.id,
                            colId: active.data.current?.task?.columnId,
                        },
                        {
                            id: over.data.current?.task.id,
                            colId: over.data.current?.task.columnId,
                        }
                    );
                }
            }

            setOverId(null);
            setActiveTask(null);
            setActiveColumn(null);
        },
        [columns, updateColumns]
    );

    return (
        <div className="flex h-full w-full flex-col gap-4 p-4">
            <DndContext
                id={"board"}
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <CreateBoard />

                <div className="flex h-full gap-4 overflow-x-auto">
                    <SortableContext
                        items={columnIds}
                        strategy={horizontalListSortingStrategy}
                    >
                        <AnimatePresence>
                            {columns.map((column) => (
                                <motion.div
                                    key={column.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Column
                                        columnId={column.id}
                                        overId={overId}
                                        activeId={
                                            activeTask?.id || activeColumn?.id
                                        }
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </SortableContext>
                </div>

                <DragOverlay>
                    {activeTask && (
                        <div className="rounded-lg border bg-card p-4 shadow-md">
                            <h3 className="font-medium">{activeTask.title}</h3>
                            {activeTask.description && (
                                <p className="text-sm text-muted-foreground">
                                    {activeTask.description}
                                </p>
                            )}
                        </div>
                    )}
                    {activeColumn && (
                        <div className="w-[300px] rounded-lg border bg-card p-4 shadow-md">
                            <h3 className="font-medium">
                                {activeColumn.title}
                            </h3>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

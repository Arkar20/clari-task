import {} from "@/lib/ai";
import { Column, Task } from "@/types";

export type SearchParamsTool = {
    columnName: string;
    taskName: string;
};
export type TaskWithColumn = Task & {
    column: string;
};

export const handleSearchTasks = async (
    board: Column[]
): Promise<TaskWithColumn[]> => {
    const columns = board;

    let results = columns.flatMap((column) =>
        column.tasks.map((task) => ({
            ...task,
            column: column.title,
            task: task.title,
            description: task.description,
            board: column.title,
        }))
    );

    return results;
};

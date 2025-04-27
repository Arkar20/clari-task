import { ToolName, ToolParamsMap } from "@/app/actions/openai/tool";
import { Column, Task, useBoardStore } from "@/store/useBoardStore";

export type SearchParamsTool = {
    columnName: string;
    taskName: string;
};
export type TaskWithColumn = Task & {
    column: string;
};

export const useAiHandler = () => {
    const { columns, addTask } = useBoardStore();

    const handleSearchTasks = async (
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

    const handleAddTask = async (args: ToolParamsMap["create_task"]) => {
        const board = columns.find((board) =>
            args.columnName
                .trim()
                .toLowerCase()
                .includes(board.title.toLowerCase())
        );

        if (!board) {
            alert("Board Not Found");
            return;
        }

        const task = {
            id: (columns.length + 1).toString(),
            title: args.taskName,
            description: args.description,
        };

        addTask(board.id, task);

        return [task];
    };

    const handleTool = (
        toolName: ToolName | string,
        args: ToolParamsMap[ToolName]
    ) => {
        switch (toolName) {
            case "create_task":
                return handleAddTask(args);
            case "search_tasks":
                return handleSearchTasks(columns);
            default:
                throw new Error("No Tool Handler Found!");
                return [];
                break;
        }
    };

    return { handleTool };
};

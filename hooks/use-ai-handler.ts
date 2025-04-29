import {
    CreateParamsTool,
    FindParamTool,
    RemoveParamTool,
    ToolName,
    ToolParamsMap,
    UpdateParamsTool,
} from "@/app/actions/openai/tool";
import { generateUUID } from "@/lib/utils";
import { Column, Task, useBoardStore } from "@/store/useBoardStore";

export type SearchParamsTool = {
    columnName: string;
    taskName: string;
};
export type TaskWithColumn = Task & {
    column: string;
};

export const useAiHandler = () => {
    const { columns, addTask, updateColumns } = useBoardStore();

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
            id: generateUUID(),
            title: args.taskName,
            description: args.description,
        };

        addTask(board.id, task);

        return [task];
    };

    const handleFindTask = (args: ToolParamsMap["find_task"]) => {
        console.log("finding single task", args);

        // find in board
        const board = columns.find((board) =>
            board.title
                .trim()
                .toLowerCase()
                .includes(args.columnName.trim().toLowerCase())
        );

        // find in tasks
        const task = board?.tasks.find((task) =>
            task.title
                .trim()
                .toLowerCase()
                .includes(args.taskName.trim().toLowerCase())
        );

        console.log(task);

        return [task];
    };

    const handleRemoveTask = (args: ToolParamsMap["remove_task"]) => {
        // find in board
        let boards = columns.flatMap((column) =>
            column.tasks.map((task) => ({
                ...task,
                column: column.title,
                task: task.title,
                description: task.description,
                board: column.title,
            }))
        );
        const taskToDelete = boards.find((task) => task.id === args.taskId);

        // update the board
        const boardIndex = columns.findIndex(
            (board) => board.title === taskToDelete?.column
        );

        if (boardIndex < 0) {
            new Error("No Board Found To Delete.");
        }

        const tasks = columns[boardIndex].tasks.filter(
            (task) => task.id !== taskToDelete?.id
        );

        console.log(tasks);

        if (!tasks) {
            console.log("Could not find tasks", tasks);
            return [taskToDelete];
        }

        columns[boardIndex].tasks = tasks;

        updateColumns(columns);

        return taskToDelete;
    };

    const handleUpdateTask = (args: UpdateParamsTool) => {
        // find in board
        let boards = columns.flatMap((column) =>
            column.tasks.map((task) => ({
                ...task,
                column: column.title,
                task: task.title,
                description: task.description,
                board: column.title,
            }))
        );
        const taskToUpdate = boards.find((task) => task.id === args.taskId);

        // update the board
        const boardIndex = columns.findIndex(
            (board) => board.title === taskToUpdate?.column
        );

        if (boardIndex < 0) {
            new Error("No Board Found To Delete.");
        }

        const tasks = columns[boardIndex].tasks.map((task) => {
            if (task.id === taskToUpdate?.id) {
                return {
                    ...task,
                    title: args.taskName ?? task.title,
                    description: args.description ?? task.description,
                };
            }

            return task;
        });

        if (!tasks) {
            console.log("Could not find tasks", tasks);
            return [taskToUpdate];
        }

        columns[boardIndex].tasks = tasks;

        updateColumns(columns);

        return taskToUpdate;
    };

    const handleTool = (toolName: ToolName, args: ToolParamsMap[ToolName]) => {
        switch (toolName) {
            case "search_tasks":
                return handleSearchTasks(columns);

            case "create_task":
                return handleAddTask(args as CreateParamsTool);

            case "find_task":
                return handleFindTask(args as FindParamTool);

            case "remove_task":
                return handleRemoveTask(args as RemoveParamTool);

            case "update_task":
                return handleUpdateTask(args as UpdateParamsTool);

            default:
                throw new Error("No Tool Handler Found!");
                return [];
                break;
        }
    };

    return { handleTool };
};

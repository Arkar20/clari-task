import { Column } from "@/store/useBoardStore";
import { handleSearchTasks, SearchParamsTool, TaskWithColumn } from "./handler";

type ToolName = "search_tasks" | "create_task";

export type ToolParamsMap = {
    search_tasks: SearchParamsTool;
    create_task: void;
};

type AiTool<Name extends ToolName = ToolName> = {
    function: {
        name: Name;
        description: string;
        parameters: any;
    };
    type: "function";
    handleTool?: (
        board: Column[],
        params: ToolParamsMap[Name]
    ) => Promise<TaskWithColumn[]>;
};

export const searchTool: AiTool<"search_tasks"> = {
    type: "function",
    function: {
        name: "search_tasks",
        description: "Search tasks by column name, task name, or description",
        parameters: {
            type: "object",
            properties: {
                columnName: { type: "string", description: "Column name" },
                taskName: { type: "string", description: "Task name" },
                description: {
                    type: "string",
                    description: "Task description",
                },
            },
            required: [],
        },
    },
    handleTool: async (board) => {
        return await handleSearchTasks(board);
    },
};

export const createTicketTool: AiTool<"create_task"> = {
    type: "function",
    function: {
        name: "create_task",
        description: "Create a new task/ticket in a specific column",
        parameters: {
            type: "object",
            properties: {
                columnName: {
                    type: "string",
                    description:
                        "The name of the column where the task will be added (e.g., 'To Do', 'In Progress')",
                },
                taskName: {
                    type: "string",
                    description: "The title or name of the task to create",
                },
                description: {
                    type: "string",
                    description:
                        "A brief description of what the task is about",
                },
                dueDate: {
                    type: "string",
                    format: "date",
                    description: "Optional due date in YYYY-MM-DD format",
                },
            },
            required: ["columnName", "taskName"],
        },
    },
};

export const tools = [searchTool];

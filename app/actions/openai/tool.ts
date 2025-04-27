import { SearchParamsTool } from "./handler";

export type ToolName = "search_tasks" | "create_task";

type CreateParamsTool = {
    columnName: string;
    taskName: string;
    description?: string;
};

export type ToolParamsMap = {
    search_tasks: SearchParamsTool;
    create_task: CreateParamsTool;
};

type AiTool<Name extends ToolName = ToolName> = {
    function: {
        name: Name;
        description: string;
        parameters: any;
    };
    type: "function";
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
            },
            required: ["columnName", "taskName"],
        },
    },
};

export const tools = [searchTool, createTicketTool];

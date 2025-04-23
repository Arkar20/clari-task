import { ChatCompletionTool } from "openai/resources/index.mjs";

export const searchTool: ChatCompletionTool = {
    type: "function",
    function: {
        name: "search_tasks",
        description: "Search tasks by column name, task name, or description",
        parameters: {
            type: "object",
            properties: {
                columnName: {
                    type: "string",
                    description:
                        "The name of the column where the task might be, e.g., 'To Do', 'In Progress', 'Done'",
                },
                taskName: {
                    type: "string",
                    description: "The exact or partial name of the task",
                },
                description: {
                    type: "string",
                    description:
                        "A keyword or phrase to match in the task's description",
                },
            },
            required: [],
        },
    },
};

export const createTicketTool: ChatCompletionTool = {
    type: "function",
    function: {
        name: "create_ticket",
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

export const tools = [searchTool, createTicketTool];

export const toolNames = tools.map((tool) => tool.function.name);

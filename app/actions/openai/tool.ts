import { SearchParamsTool } from "./handler";

type Tool =
    | {
          name: "search_tasks";
          params: SearchParamsTool;
      }
    | {
          name: "create_task";
          params: CreateParamsTool;
      }
    | {
          name: "find_task";
          params: FindParamTool;
      }
    | {
          name: "remove_task";
          params: RemoveParamTool;
      };

export type RemoveParamTool = {
    taskId: string;
};

export type FindParamTool = {
    columnName: string;
    taskName: string;
    description?: string;
};
export type ToolName = Tool extends { name: infer Name } ? Name : never;

export type CreateParamsTool = {
    columnName: string;
    taskName: string;
    description?: string;
};

export type ToolParamsMap = {
    search_tasks: SearchParamsTool;
    create_task: CreateParamsTool;
    find_task: {
        columnName: string;
        taskName: string;
        description?: string;
    };
    remove_task: {
        taskId: string;
    };
    create_bulk_tasks: CreateParamsTool & {
        count: string;
    };
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
        description:
            "Create a new task/ticket in a specific column.Limit the action for one record.",
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

export const findTaskTool: AiTool<"find_task"> = {
    type: "function",
    function: {
        name: "find_task",
        description:
            "Find a task by column name, task name, or description and return its ID",
        parameters: {
            type: "object",
            properties: {
                columnName: {
                    type: "string",
                    description:
                        "The name of the column where the task might be located",
                },
                taskName: {
                    type: "string",
                    description: "The exact or partial name of the task",
                },
                description: {
                    type: "string",
                    description:
                        "A keyword or phrase to search in the task's description",
                },
            },
            required: ["columnName", "taskName"],
        },
    },
};

export const removeTaskTool: AiTool<"remove_task"> = {
    type: "function",
    function: {
        name: "remove_task",
        description:
            "Remove a task by its ID. Get the ids from find_task tool. Limit the action for one record. ",
        parameters: {
            type: "object",
            properties: {
                taskId: {
                    type: "string",
                    description: "The ID of the task to remove",
                },
            },
            required: ["taskId"],
        },
    },
};

export const tools = [
    searchTool,
    createTicketTool,
    findTaskTool,
    removeTaskTool,
    createBulkTicketTool,
];

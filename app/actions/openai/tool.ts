type Tool =
    | {
          name: "search_tasks";
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
      }
    | {
          name: "update_task";
          params: CreateParamsTool;
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
    search_tasks: undefined;
    create_task: CreateParamsTool;
    find_task: {
        columnName: string;
        taskName: string;
        description?: string;
    };
    remove_task: {
        taskId: string;
    };
    update_task: UpdateParamsTool;
};

export type UpdateParamsTool = {
    taskId: string;
} & CreateParamsTool;

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

export const updateTicketTool: AiTool<"update_task"> = {
    type: "function",
    function: {
        name: "update_task",
        description:
            "Update an existing task/ticket's name, description, or column. Limit the action to one record.",
        parameters: {
            type: "object",
            properties: {
                taskId: {
                    type: "string",
                    description: "The unique ID of the task to update",
                },
                taskName: {
                    type: "string",
                    description: "The new name/title for the task (optional)",
                },
                description: {
                    type: "string",
                    description: "The new description for the task (optional)",
                },
                columnName: {
                    type: "string",
                    description:
                        "The new column to move the task to (e.g., 'In Progress') (optional)",
                },
            },
            required: ["taskId"],
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
    // findTaskTool,
    removeTaskTool,
    updateTicketTool,
];

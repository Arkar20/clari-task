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
      }
    | {
          name: "create_column";
          params: CreateColumnTool;
      }
    | {
          name: "swap_board";
          params: SwapBoardTool;
      }
    | {
          name: "swap_task";
          params: SwapTaskTool;
      };

export interface SwapTaskTool {
    selected: {
        id: string;
        colId: string;
    };
    target: {
        id: string;
        colId: string;
    };
}
export type RemoveParamTool = {
    taskId: string;
};

export type SwapBoardTool = {
    selectedId: string | null;
    targetId: string | null;
};

export type CreateColumnTool = {
    title: string;
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
    create_column: CreateColumnTool;
    swap_board: SwapBoardTool;
    swap_task: SwapTaskTool;
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
            "Update the details of a single task, specifically its name and description. This action does not affect the task’s position or column assignment.",
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

export const createColumnTool: AiTool<"create_column"> = {
    type: "function",
    function: {
        name: "create_column",
        description: "Create a new column or board.",
        parameters: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: "The title of the new column",
                },
                sort: {
                    type: "number",
                    description: "The sort order of the column (optional)",
                },
            },
            required: ["title"],
        },
    },
};

export const swapBoardTool: AiTool<"swap_board"> = {
    type: "function",
    function: {
        name: "swap_board",
        description:
            "Moving the sort order of two boards (or columns) by their IDs.",
        parameters: {
            type: "object",
            properties: {
                selectedId: {
                    type: "string",
                    description: "The ID of the first board to swap",
                },
                targetId: {
                    type: "string",
                    description: "The ID of the second board to swap",
                },
            },
            required: ["selectedId", "targetId"],
        },
    },
};

export const swapTaskTool: AiTool<"swap_task"> = {
    type: "function",
    function: {
        name: "swap_task",
        description:
            "Swap the position of two tasks by their task IDs and column IDs. This action is used for reordering tasks within a column or moving a task to a different column. It does not modify task content like name or description.",
        parameters: {
            type: "object",
            properties: {
                selected: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            description: "The ID of the first task to swap",
                        },
                        colId: {
                            type: "string",
                            description: "The column ID of the first task",
                        },
                    },
                    required: ["id", "colId"],
                },
                target: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            description: "The ID of the second task to swap",
                        },
                        colId: {
                            type: "string",
                            description: "The column ID of the second task",
                        },
                    },
                    required: ["id", "colId"],
                },
            },
            required: ["selected", "target"],
        },
    },
};

export const tools = [
    searchTool,
    createTicketTool,
    createColumnTool,
    removeTaskTool,
    updateTicketTool,
    swapBoardTool,
    swapTaskTool,
];

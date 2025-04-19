export const searchTool = {
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

"use server";

export async function handleAIChat(message: string) {
    try {
        // Check if the message is a command to add a task
        if (message.toLowerCase().startsWith("add task")) {
            const taskTitle = message.substring(8).trim();
            if (taskTitle) {
                return {
                    success: true,
                    response: `I'll add the task "${taskTitle}" to your To Do column.`,
                    action: {
                        type: "ADD_TASK",
                        payload: {
                            title: taskTitle,
                            description: "Added by AI assistant",
                        },
                    },
                };
            }
        }

        // Default AI response
        return {
            success: true,
            response:
                "I'm an AI assistant. You can add tasks by typing 'add task [task title]'.",
        };
    } catch (error) {
        console.error("Error in handleAIChat:", error);
        return {
            success: false,
            error: "Failed to process message",
        };
    }
}

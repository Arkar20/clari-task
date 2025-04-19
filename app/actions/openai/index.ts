import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const handleAiCall = async (messages: ChatCompletionMessageParam[]) => {
    const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages,
        max_tokens: 100,
        tools: [
            {
                type: "function",
                function: {
                    name: "search_tasks",
                    description:
                        "Search tasks by column name, task name, or description",
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
                                description:
                                    "The exact or partial name of the task",
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
            },
        ],
    });

    const assistantMessage = completion.choices[0];

    if (assistantMessage.message?.tool_calls?.length) {
        const toolCall = assistantMessage.message.tool_calls[0];
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        return {
            success: true,
            message: `Function called: ${functionName} with arguments ${JSON.stringify(
                args
            )}`,
        };
    }

    if (assistantMessage?.message?.content) {
        return {
            success: true,
            message: assistantMessage?.message?.content,
        };
    }

    return {
        success: false,
        message: "Failed to get a response from the assistant.",
    };
};

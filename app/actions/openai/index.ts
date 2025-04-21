import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export type AIResponse =
    | {
          type: "message";
          success: boolean;
          message: string;
      }
    | {
          type: "tool_call";
          success: boolean;
          tool: string;
          toolCallId: string;
          args: Object;
          toolcall_message: OpenAI.Chat.Completions.ChatCompletionMessage;
      };

export const handleAiCall = async (
    messages: ChatCompletionMessageParam[]
): Promise<AIResponse> => {
    try {
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
                {
                    type: "function",
                    function: {
                        name: "create_ticket",
                        description:
                            "Create a new task/ticket in a specific column",
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
                                    description:
                                        "The title or name of the task to create",
                                },
                                description: {
                                    type: "string",
                                    description:
                                        "A brief description of what the task is about",
                                },
                                dueDate: {
                                    type: "string",
                                    format: "date",
                                    description:
                                        "Optional due date in YYYY-MM-DD format",
                                },
                            },
                            required: ["columnName", "taskName"],
                        },
                    },
                },
            ],
        });

        const assistantMessage = completion.choices[0];

        console.log("Assistant message:", assistantMessage);

        if (
            assistantMessage.finish_reason == "tool_calls" &&
            assistantMessage.message.tool_calls
        ) {
            const message = assistantMessage.message;

            const toolCall = assistantMessage.message.tool_calls[0];

            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);

            return {
                type: "tool_call",
                success: true,
                args,
                tool: functionName,
                toolCallId: toolCall.id,
                toolcall_message: message,
            };
        }

        if (assistantMessage?.message?.content) {
            return {
                type: "message",
                success: true,
                message: assistantMessage?.message?.content,
            };
        }

        return {
            type: "message",
            success: false,
            message: "Failed to get a response from the assistant.",
        };
    } catch (error) {
        console.error("Error in handleAiCall:", error);

        return {
            type: "message",
            success: false,
            message: `Error in handleAiCall: ${JSON.stringify(error)}`,
        };
    }
};

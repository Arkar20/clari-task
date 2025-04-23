import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { createTicketTool, searchTool, tools } from "./tool";

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
          toolCallMessage: OpenAI.Chat.Completions.ChatCompletionMessage;
      };

export const handleAiCall = async (
    messages: ChatCompletionMessageParam[]
): Promise<AIResponse> => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages,
            max_tokens: 100,
            tools: tools,
        });

        const assistantMessage = completion.choices[0];

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
                toolCallMessage: message,
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

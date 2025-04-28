import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { tools } from "./tool";

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
          message: OpenAI.Chat.Completions.ChatCompletionMessage;
          toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
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

        console.log(assistantMessage);

        if (assistantMessage.message.tool_calls) {
            const toolCalls = assistantMessage.message.tool_calls;

            return {
                type: "tool_call",
                success: true,
                toolCalls,
                message: assistantMessage.message,
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

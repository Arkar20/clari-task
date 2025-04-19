import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const handleAiCall = async (messages: ChatCompletionMessageParam[]) => {
    const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages,
    });

    const assistantMessage = completion.choices[0]?.message?.content;

    if (assistantMessage) {
        return {
            success: true,
            message: assistantMessage,
        };
    }

    return {
        success: false,
        message: "Failed to get a response from the assistant.",
    };
};

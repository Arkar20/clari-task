"use client";
import React, { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { addMessage } from "@/app/actions/chat-message";
import { AIResponse } from "@/app/actions/openai";
import { useAiHandler } from "@/hooks/use-ai-handler";
import { ToolName } from "@/app/actions/openai/tool";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import AudioRecorder from "./audio-recorder";

export const AIChatbotCreateForm = ({
    addToLocalMessages,
}: {
    addToLocalMessages: (message: any) => void;
}) => {
    const [isPending, startTransition] = useTransition();

    const [input, setInput] = useState("");

    const { handleTool } = useAiHandler();

    const { toast } = useToast();

    const handleSendMessage = async () => {
        if (!input.trim() || isPending) return;

        const message = input.trim();
        setInput("");

        try {
            addToLocalMessages({
                role: "user",
                content: message,
            });

            const res = await addMessage({
                role: "user",
                content: message,
            });

            if (!res) {
                throw new Error("Error Conmunicating with AI Bot ");
            }

            handleToolCall(res);
        } catch (error) {
            console.error("Error sending message:", error);

            // Add error message to store
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
            });
        }
    };

    const handleToolCall = async (response: AIResponse) => {
        if (response.success && response.type === "message") {
            addToLocalMessages({
                role: "assistant",
                content: response.message,
            });

            addMessage({
                role: "assistant",
                content: response.message,
            });
            return;
        }
        if (response.success && response.type === "tool_call") {
            const { toolCalls, message } = response;

            addMessage(message);

            for (const toolCall of toolCalls) {
                const args = toolCall.function.arguments
                    ? JSON.parse(toolCall.function.arguments)
                    : undefined;

                const results = await handleTool(
                    toolCall.function.name as ToolName,
                    args
                );

                if (results) {
                    const response = await addMessage({
                        role: "tool",
                        content: JSON.stringify(results),
                        tool_call_id: toolCall.id,
                    });

                    handleToolCall(response);
                }
            }
        }
    };
    return (
        <div className="flex gap-2 p-4 border-t dark:border-gray-800">
            <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        startTransition(() => handleSendMessage());
                    }
                }}
                disabled={isPending}
                className="dark:bg-gray-800 dark:border-gray-700"
            />
            <AudioRecorder />
            <Button
                onClick={() => startTransition(() => handleSendMessage())}
                disabled={isPending}
            >
                {isPending ? "Sending..." : "Send"}
            </Button>
        </div>
    );
};

export default AIChatbotCreateForm;

"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { handleAIChat } from "@/app/actions/ai-chat";
import { useChatStore } from "@/store/useChatStore";
import {
    prepareMessages,
    handleSearchTasks,
    SearchParamsTool,
} from "@/lib/ai/index";
import { toast } from "sonner";
import { AiTextMessage } from "./ai-text-message";
import { toolNames } from "@/app/actions/openai/tool";

export default function AIChatbot() {
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Get messages and store functions from Zustand store
    const { addMessage, messages } = useChatStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading || !mounted) return;

        const message = input.trim();
        setInput("");
        setIsLoading(true);

        try {
            // Add user message to store
            addMessage({
                role: "user",
                content: message,
            });

            const messages = prepareMessages();

            // // call open ai api
            const response = await handleAIChat(messages);

            if (response.success && response.type === "message") {
                addMessage({
                    role: "assistant",
                    content: response.message,
                });
            }

            if (response.success && response.type === "tool_call") {
                const { toolCallId, toolCallMessage, args } = response;

                addMessage(toolCallMessage);

                // Handle tool call here
                let results = [];

                for (const tool of toolNames) {
                    switch (tool) {
                        case "search_tasks":
                            results = await handleSearchTasks(
                                args as SearchParamsTool
                            );
                            break;

                        default:
                            break;
                    }
                }

                if (results.length > 0) {
                    addMessage({
                        role: "tool",
                        content: JSON.stringify(results.length),
                        tool_call_id: toolCallId,
                    });

                    const messages = prepareMessages();

                    const response = await handleAIChat(messages);

                    if (response.success && response.type === "message") {
                        addMessage({
                            role: "assistant",
                            content: response.message,
                        });
                    }
                }
            }

            // put the response to the chat history
        } catch (error) {
            console.error("Error sending message:", error);
            // Add error message to store
            toast.error("Error Connectiong To AI Assistant.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <>
            <Button
                variant="outline"
                size="icon"
                className="fixed bottom-4 right-4 h-12 w-12 rounded-full z-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <MessageSquare className="h-5 w-5" />
            </Button>

            {isOpen && (
                <div className="fixed right-4 bottom-20 w-[400px] max-h-[600px] bg-background border rounded-lg shadow-lg z-40 dark:border-gray-800">
                    <div className="p-4 border-b flex items-center justify-between dark:border-gray-800">
                        <h2 className="text-lg font-semibold">AI Assistant</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <ScrollArea className="h-[400px] w-full p-4">
                        <div className="space-y-4">
                            {messages
                                .filter(
                                    (message) =>
                                        message.role === "assistant" ||
                                        message.role === "user"
                                )
                                .map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${
                                            message.role === "user"
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 ${
                                                message.role === "user"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted dark:bg-gray-800"
                                            }`}
                                        >
                                            <AiTextMessage message={message} />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </ScrollArea>
                    <div className="flex gap-2 p-4 border-t dark:border-gray-800">
                        <Input
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSendMessage();
                                }
                            }}
                            disabled={isLoading}
                            className="dark:bg-gray-800 dark:border-gray-700"
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending..." : "Send"}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

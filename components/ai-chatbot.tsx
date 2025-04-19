"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { handleAIChat } from "@/app/actions/ai-chat";
import { useChatStore } from "@/store/useChatStore";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { useBoardStore } from "@/store/useBoardStore";

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
                id: Date.now().toString(),
                role: "user",
                title: message,
            });

            const messages = prepareMessages(message);

            // call open ai api
            const response = await handleAIChat(messages);

            if (response.success) {
                addMessage({
                    id: Date.now().toString(),
                    role: "assistant",
                    title: response.message,
                });
            }

            // put the response to the chat history
        } catch (error) {
            console.error("Error sending message:", error);
            // Add error message to store
            addMessage({
                id: (Date.now() + 1).toString(),
                role: "user",
                title: "Error connecting to chat bot",
            });
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
                            {messages.map((message) => (
                                <div
                                    key={message.id}
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
                                        {message.title}
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

const prepareMessages = (message: string): ChatCompletionMessageParam[] => {
    const history = useChatStore.getState().messages;

    const columns = useBoardStore.getState().columns;

    const formattedMessages = history.map((msg) => ({
        role: msg.role,
        content: msg.title,
    }));

    // Optionally add a system prompt at the beginning
    return [
        {
            role: "system",
            content:
                `You are an AI assistant that helps users manage tasks, projects, and boards — similar to Trello.
            Users will provide you with task, project, and board information.
            Your job is to understand the structure, remember the details, and answer any questions they ask about it.
            You can:
            - check the state of the task
            Only respond based on the given data. If the user asks something not provided, ask them for the missing info.
            here's the data you have in json string format: ${JSON.stringify(
                columns
            )}
            Be concise, helpful, and stay in assistant mode.`.trim(),
        },
        ...(formattedMessages as ChatCompletionMessageParam[]),
    ];
};

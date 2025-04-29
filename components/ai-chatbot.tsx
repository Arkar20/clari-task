"use client";

import { useOptimistic, useTransition } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { AiTextMessage } from "./ai-text-message";
import AiChatbotCreateForm from "./ai-chatbot-create-form";

export default function AIChatbot({ messages }: { messages: any }) {
    const [optimisticMessages, addOptimisticMessage] = useOptimistic<any, any>(
        messages,
        (state, newMessage) => [...state, newMessage]
    );

    const [isPending, startTransition] = useTransition();

    const addToLocalMessages = (message: any) => {
        startTransition(() => {
            addOptimisticMessage(message);
        });
    };

    return (
        <>
            <div className="w-full max-h-[600px] bg-background border rounded-lg shadow-lg z-40 dark:border-gray-800">
                <div className="p-4 border-b flex items-center justify-between dark:border-gray-800">
                    <h2 className="text-lg font-semibold">AI Assistant</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        // onClick={() => setIsOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <ScrollArea className="h-[400px] w-full p-4">
                    <div className="space-y-4">
                        {optimisticMessages
                            .filter(
                                (message: any) =>
                                    (message.role === "assistant" ||
                                        message.role === "user") &&
                                    message.content
                            )
                            .map((message: any, index: number) => (
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
                <AiChatbotCreateForm addToLocalMessages={addToLocalMessages} />
            </div>
        </>
    );
}

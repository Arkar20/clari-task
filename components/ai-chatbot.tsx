"use client";

import { useEffect, useOptimistic, useRef, useTransition } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { AiTextMessage } from "./ai-text-message";
import AiChatbotCreateForm from "./ai-chatbot-create-form";

export default function AIChatbot({ messages }: { messages: any }) {
    const [optimisticMessages, addOptimisticMessage] = useOptimistic<any, any>(
        messages,
        (state, newMessage) => [...state, newMessage]
    );

    const [isPending, startTransition] = useTransition();

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [optimisticMessages]);

    const addToLocalMessages = (message: any) => {
        startTransition(() => {
            addOptimisticMessage(message);
        });
    };

    return (
        <>
            <div className="w-full h-full bg-background border rounded-lg shadow-lg z-40 dark:border-gray-800">
                <div className="p-4 border-b flex items-center justify-between dark:border-gray-800">
                    <h2 className="text-lg font-semibold">AI Assistant</h2>
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
                    {/* 👇 Scroll target */}
                    <div ref={bottomRef} />
                </ScrollArea>
                <AiChatbotCreateForm addToLocalMessages={addToLocalMessages} />
            </div>
        </>
    );
}

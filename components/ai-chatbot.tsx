"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { handleAIChat } from "@/app/actions/ai-chat";
import { useBoardStore } from "@/store/useBoardStore";

interface Message {
    id: string;
    text: string;
    isUser: boolean;
}

export default function AIChatbot() {
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Get messages from Zustand store
    const messages = useBoardStore((state) => state.aiMessages);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading || !mounted) return;

        setInput("");
        setIsLoading(true);

        try {
            await handleAIChat(input);
        } catch (error) {
            console.error("Error sending message:", error);
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
                <div className="fixed right-4 bottom-20 w-[400px] max-h-[600px] bg-background border rounded-lg shadow-lg z-40">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">AI Assistant</h2>
                    </div>
                    <ScrollArea className="h-[400px] w-full p-4">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${
                                        message.isUser
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${
                                            message.isUser
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        }`}
                                    >
                                        {message.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="flex gap-2 p-4 border-t">
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

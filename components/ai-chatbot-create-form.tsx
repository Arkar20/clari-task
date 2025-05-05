"use client";
import React, { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { addMessage, createAIMessage } from "@/app/actions/chat-message";
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

            const res = await createAIMessage({
                role: "user",
                content: message,
            });

            if (!res) {
                throw new Error("Error Conmunicating with AI Bot ");
            }
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

    return (
        <div className="flex gap-2 p-4 border-t dark:border-gray-800">
            <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        startTransition(() => {
                            handleSendMessage();
                        });
                    }
                }}
                disabled={isPending}
                className="dark:bg-gray-800 dark:border-gray-700"
            />
            {/* <AudioRecorder /> */}
            <Button
                onClick={() =>
                    startTransition(() => {
                        handleSendMessage();
                    })
                }
                disabled={isPending}
            >
                {isPending ? "Sending..." : "Send"}
            </Button>
        </div>
    );
};

export default AIChatbotCreateForm;

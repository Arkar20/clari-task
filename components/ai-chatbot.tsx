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

type SearchParamsTool = {
    columnName: string;
    taskName: string;
};

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

            console.log(messages);

            // // call open ai api
            const response = await handleAIChat(messages);

            if (response.success && response.type === "message") {
                addMessage({
                    role: "assistant",
                    content: response.message,
                });
            }

            if (response.success && response.type === "tool_call") {
                const { tool, args } = response;

                // Handle tool call here
                if (response.tool === "search_tasks") {
                    addMessage(response.toolcall_message);

                    handleSearchTasks(
                        response.toolCallId,
                        args as SearchParamsTool
                    );
                }
            }

            // put the response to the chat history
        } catch (error) {
            console.error("Error sending message:", error);
            // Add error message to store
            addMessage({
                role: "user",
                content: "Error connecting to chat bot",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchTasks = async (
        toolCallId: string,
        { columnName, taskName }: SearchParamsTool
    ) => {
        const { columns } = useBoardStore.getState();

        let results = columns.flatMap((column) =>
            column.tasks.map((task) => ({
                column: column.title,
                task: task.title,
                description: task.description,
                board: column.title,
            }))
        );

        if (columnName) {
            results = results.filter((task) =>
                task.board.toLowerCase().includes(columnName.toLowerCase())
            );
        }

        if (taskName) {
            results = results.filter((task) =>
                task.task.toLowerCase().includes(taskName.toLowerCase())
            );
        }

        addMessage({
            role: "tool",
            content: JSON.stringify(results),
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
                                            {typeof message.content === "string"
                                                ? message.content
                                                : Array.isArray(message.content)
                                                ? message.content.map(
                                                      (part, index) => {
                                                          if ("text" in part) {
                                                              return (
                                                                  <span
                                                                      key={
                                                                          index
                                                                      }
                                                                  >
                                                                      {
                                                                          part.text
                                                                      }
                                                                  </span>
                                                              );
                                                          }
                                                          if (
                                                              "refusal" in part
                                                          ) {
                                                              return (
                                                                  <em
                                                                      key={
                                                                          index
                                                                      }
                                                                  >
                                                                      {
                                                                          part.refusal
                                                                      }
                                                                  </em>
                                                              );
                                                          }
                                                          return null;
                                                      }
                                                  )
                                                : null}
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

const prepareMessages = (): ChatCompletionMessageParam[] => {
    const history = useChatStore.getState().messages;

    // Optionally add a system prompt at the beginning
    return [
        {
            role: "system",
            content:
                `You are a task management assistant that helps users manage boards and tasks, like Trello.
Users may ask about tasks based on column names, task names, or descriptions.
Use tools like 'search_tasks' if you need to look into the task list to answer their questions.
Be concise, clear, and only respond with information you can confirm from user input or tool results.`.trim(),
        },
        ...history,
    ];
};

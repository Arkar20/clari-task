import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { useChatStore } from "@/store/useChatStore";
import { Column } from "@/store/useBoardStore";

export const prepareMessages = (history: any): ChatCompletionMessageParam[] => {
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

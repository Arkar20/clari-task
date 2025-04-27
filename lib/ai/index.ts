import {
    ChatCompletionContentPartText,
    ChatCompletionMessageParam,
} from "openai/resources/index.mjs";
import { useChatStore } from "@/store/useChatStore";
import { Column, Task, useBoardStore } from "@/store/useBoardStore";

export type SearchParamsTool = {
    columnName: string;
    taskName: string;
};

export const prepareMessages = (): ChatCompletionMessageParam[] => {
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
export type TaskWithColumn = Task & {
    column: string;
};
export const handleSearchTasks = async ({
    columnName,
    taskName,
}: SearchParamsTool): Promise<TaskWithColumn[]> => {
    const { columns } = useBoardStore.getState();

    let results = columns.flatMap((column) =>
        column.tasks.map((task) => ({
            ...task,
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

    return results;
};

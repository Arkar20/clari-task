import {
    CreateParamsTool,
    FindParamTool,
    RemoveParamTool,
    ToolName,
    ToolParamsMap,
    UpdateParamsTool,
} from "@/app/actions/openai/tool";
import { prisma } from "@/lib/prisma";
import { createTask } from "../task";

const handleSearchTasks = async () => {
    const boards = await prisma.board.findMany({
        include: {
            tasks: true,
        },
    });

    return boards;
};

const handleAddTask = async (args: CreateParamsTool) => {
    const board = await prisma.board.findFirstOrThrow({
        where: {
            title: args.columnName,
        },
    });

    const task = await createTask(board.id, {
        title: args.taskName,
        description: args.description,
        columnId: board.id,
    });

    return task;
};

const handleRemoveTask = async (args: RemoveParamTool) => {
    const taskRemoved = await prisma.task.delete({
        where: { id: args.taskId },
    });

    return taskRemoved;
};
const handleUpdateTask = async (args: UpdateParamsTool) => {
    const taskRemoved = await prisma.task.update({
        where: { id: args.taskId },
        data: {
            title: args.taskName,
            description: args.description,
        },
    });

    return taskRemoved;
};

export const handleTool = (
    toolName: ToolName,
    args: ToolParamsMap[ToolName]
) => {
    switch (toolName) {
        case "search_tasks":
            return handleSearchTasks();

        case "create_task":
            return handleAddTask(args as CreateParamsTool);

        case "remove_task":
            return handleRemoveTask(args as RemoveParamTool);

        case "update_task":
            return handleUpdateTask(args as UpdateParamsTool);

        default:
            throw new Error("No Tool Handler Found!");
            return [];
            break;
    }
};

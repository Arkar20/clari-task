import {
    CreateColumnTool,
    CreateParamsTool,
    RemoveParamTool,
    SwapBoardTool,
    SwapTaskTool,
    ToolName,
    ToolParamsMap,
    UpdateParamsTool,
} from "@/app/actions/openai/tool";
import { prisma } from "@/lib/prisma";
import { createTask } from "../task";
import { createBoard, swapBoardSort } from "../board";
import { swapTaskSort } from "@/app/actions/task";

const handleSearchTasks = async () => {
    console.log("triggered search task");
    const boards = await prisma.board.findMany({
        include: {
            tasks: true,
        },
    });

    return boards;
};

const handleAddTask = async (args: CreateParamsTool) => {
    console.log("triggered add task", args);
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
    console.log("triggered remove task", args);
    const taskRemoved = await prisma.task.delete({
        where: { id: args.taskId },
    });

    return taskRemoved;
};

const handleUpdateTask = async (args: UpdateParamsTool) => {
    console.log("triggered update task", args);
    const taskRemoved = await prisma.task.update({
        where: { id: args.taskId },
        data: {
            title: args.taskName,
            description: args.description,
        },
    });

    return taskRemoved;
};

const handleCreateColumn = async (args: CreateColumnTool) => {
    console.log("triggered create column", args);
    const board = await createBoard({
        title: args.title,
    });

    return board;
};

const handleSwapBoard = (args: SwapBoardTool) => {
    return swapBoardSort(args.selectedId, args.targetId);
};

const handleSwapTask = async (args: SwapTaskTool) => {
    console.log("triggered swap task", args);
    return await swapTaskSort(args.selected, args.target);
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

        case "create_column":
            return handleCreateColumn(args as CreateColumnTool);

        // move board
        case "swap_board":
            return handleSwapBoard(args as SwapBoardTool);

        /// move task
        case "swap_task":
            return handleSwapTask(args as SwapTaskTool);

        default:
            throw new Error("No Tool Handler Found!");
            return [];
            break;
    }
};

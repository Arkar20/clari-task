import {
    CreateParamsTool,
    FindParamTool,
    RemoveParamTool,
    ToolName,
    ToolParamsMap,
    UpdateParamsTool,
} from "@/app/actions/openai/tool";
import { prisma } from "@/lib/prisma";

const handleSearchTasks = async () => {
    const boards = await prisma.board.findMany({
        include: {
            tasks: true,
        },
    });

    return boards;
};
export const handleTool = (
    toolName: ToolName,
    args: ToolParamsMap[ToolName]
) => {
    switch (toolName) {
        case "search_tasks":
            return handleSearchTasks();

        // case "create_task":
        //     return handleAddTask(args as CreateParamsTool);

        // case "find_task":
        //     return handleFindTask(args as FindParamTool);

        // case "remove_task":
        //     return handleRemoveTask(args as RemoveParamTool);

        // case "update_task":
        //     return handleUpdateTask(args as UpdateParamsTool);

        default:
            throw new Error("No Tool Handler Found!");
            return [];
            break;
    }
};

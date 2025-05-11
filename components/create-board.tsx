"use client";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import React, { useState, useTransition } from "react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PlusCircle } from "lucide-react";
import { createBoard } from "@/app/actions/board";
import { useBoardStore } from "@/store/useBoardStore";

export default function CreateBoard() {
    const [newColumnTitle, setNewColumnTitle] = useState("");

    const { addColumn } = useBoardStore();

    const [isPending, startTransition] = useTransition();

    const handleCreate = () => {
        startTransition(async () => {
            if (newColumnTitle.trim()) {
                await createBoard({
                    title: newColumnTitle,
                });

                addColumn(newColumnTitle.trim());

                setNewColumnTitle("");
            }
        });
    };

    return (
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Board</h1>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Column
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Column</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Column title"
                            value={newColumnTitle}
                            onChange={(e) => setNewColumnTitle(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCreate}>
                                Add
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

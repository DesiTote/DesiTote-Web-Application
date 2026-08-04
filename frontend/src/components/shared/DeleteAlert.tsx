// @/components/shared/DeleteConfirmDialog.tsx
"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react"; // Imported Loader2
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    isPending?: boolean;
    // Optional extra content rendered between the description and the footer
    // buttons — e.g. a reason picker for cancel-order, without needing a
    // separate dialog component for every confirm-with-extra-input case.
    children?: ReactNode;
    // Disables the confirm button independently of isPending — e.g. "no reason
    // selected yet" for cancel-order, while still allowing Cancel to work.
    isConfirmDisabled?: boolean;
}

export default function DeleteAlert({
    isOpen,
    onOpenChange,
    onConfirm,
    title = "Are you absolutely sure?",
    description = "This action cannot be undone. This will permanently delete the item.",
    confirmText = "Delete",
    cancelText = "Cancel",
    isPending = false,
    children,
    isConfirmDisabled = false,
}: DeleteConfirmDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-2xl max-w-sm sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900 font-bold text-lg">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 text-sm mt-1">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {children}

                <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
                    <AlertDialogCancel
                        disabled={isPending}
                        className="rounded-xl cursor-pointer font-semibold border-slate-200 text-slate-700"
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault(); // Prevents dialog auto-closing before mutation completes
                            onConfirm();
                        }}
                        disabled={isPending || isConfirmDisabled}
                        className="bg-red-600 cursor-pointer hover:bg-red-700 text-white font-semibold rounded-xl border-none min-w-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            confirmText
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import DeliveryAddressForm from "./DeliveryAddressForm";
import { Address } from "@/types/customer/address.type";

interface Props {
    trigger?: React.ReactNode;

    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    mode?: "create" | "edit";

    address?: Address | null;
}

export default function AddAddressDialog({
    trigger,
    open,
    onOpenChange,
    mode = "create",
    address,
}: Props) {
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            {mode === "create" && (
                <DialogTrigger asChild>
                    {trigger || (
                        <Button
                            variant="outline"
                            className="rounded-xl cursor-pointer"
                        >
                            Add Address
                        </Button>
                    )}
                </DialogTrigger>
            )}

            <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "edit"
                            ? "Edit Delivery Address"
                            : "Add Delivery Address"}
                    </DialogTitle>
                </DialogHeader>

                <DeliveryAddressForm
                    mode={mode}
                    address={address}
                    onSuccess={() => {
                        onOpenChange?.(false);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
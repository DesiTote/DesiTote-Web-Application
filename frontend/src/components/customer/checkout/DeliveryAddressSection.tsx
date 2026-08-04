"use client";

import { useState } from "react";
import {
    Plus,
    MapPin,
    ChevronDown,
    ChevronUp,
    Pencil,
    Trash2,
} from "lucide-react"; import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import AddAddressDialog from "./AddAddressDialog";
import { Address } from "@/types/customer/address.type";

// Brand palette: Ink Navy #1B2A41 · Canvas Cream #F5EEDE · Surface Cream #FBF8F1
// Marigold Gold #C6941E (buttons/highlights, "this is selected" state)
// Brick Maroon #7A2A28 (tags/accents, e.g. "Default Address")

interface Props {
    addresses: Address[];
    selectedAddressId?: string;

    onSelectAddress: (id: string) => void;

    onEditAddress: (
        address: Address
    ) => void;

    onDeleteAddress: (
        addressId: string
    ) => void;

    isDisabled: boolean;
}

export default function DeliveryAddressSection({
    addresses,
    selectedAddressId,
    onSelectAddress,
    onEditAddress,
    onDeleteAddress,
    isDisabled,
}: Props) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const hasAddresses = addresses.length > 0;

    // Find currently active selected address metadata object
    const selectedAddress = addresses.find((addr) => addr._id === selectedAddressId) || addresses[0];

    return (
        <Card className="rounded-3xl border border-[#1B2A41]/10 bg-[#FBF8F1] shadow-sm overflow-hidden transition-all duration-200">
            <div className="h-1.5 bg-gradient-to-r from-[#7A2A28] via-[#C6941E] to-[#1B2A41]" />

            <CardContent className="p-5">
                {/* HEADER ROW */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-[#1B2A41]">
                            Delivery Address
                        </h2>
                        {!isExpanded && hasAddresses && selectedAddress && (
                            <p className="text-xs text-[#1B2A41]/60 mt-0.5 truncate max-w-[280px] sm:max-w-md">
                                Delivering to <span className="font-semibold text-[#1B2A41]">{selectedAddress.fullName}</span>
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {hasAddresses && (
                            <Button
                                variant="outline"
                                disabled={isDisabled}
                                size="sm"
                                type="button"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="h-9 cursor-pointer text-xs rounded-xl border-[#1B2A41]/15 font-bold text-[#1B2A41] hover:bg-[#1B2A41]/5"
                            >
                                {isExpanded ? (
                                    <>Collapse <ChevronUp className="w-3.5 h-3.5 ml-1" /></>
                                ) : (
                                    <>Change <ChevronDown className="w-3.5 h-3.5 ml-1" /></>
                                )}
                            </Button>
                        )}
                        <AddAddressDialog
                            open={isCreateDialogOpen}
                            onOpenChange={setIsCreateDialogOpen}
                        />
                    </div>
                </div>

                {/* COMPACT EMPTY STATE */}
                {!hasAddresses ? (
                    <div className="border border-dashed border-[#1B2A41]/20 rounded-2xl p-5 mt-4 text-center bg-[#F5EEDE]">
                        <MapPin className="w-6 h-6 mx-auto text-[#1B2A41]/30 mb-1.5" />
                        <h3 className="text-sm font-bold text-[#1B2A41]">
                            No saved addresses found
                        </h3>
                        <p className="text-xs text-[#1B2A41]/60 mt-0.5 mb-3">
                            Add a delivery address to complete checkout
                        </p>
                        <AddAddressDialog
                            open={isCreateDialogOpen}
                            onOpenChange={setIsCreateDialogOpen}
                            trigger={
                                <Button
                                    size="sm"
                                    className="bg-[#C6941E] cursor-pointer hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1]"
                                >
                                    Add Address
                                </Button>
                            }
                        />
                    </div>
                ) : (
                    <div className="mt-4">
                        {/* VIEW 1: COLLAPSED MODE (SHOW ONLY SELECTED ADDRESS) */}
                        {!isExpanded && selectedAddress && (
                            <div className="border border-[#C6941E] bg-[#C6941E]/10 rounded-2xl p-4">

                                <div className="flex justify-between gap-4">

                                    <div className="flex-1">

                                        <div className="flex items-center gap-2">

                                            <p className="font-bold text-[#1B2A41] text-sm sm:text-base">
                                                {selectedAddress.fullName}
                                            </p>

                                            {selectedAddress.isDefault && (
                                                <span className="text-[10px] bg-[#7A2A28]/10 text-[#7A2A28] px-2 py-0.5 rounded-md font-semibold">
                                                    🏠 Default Address
                                                </span>
                                            )}

                                        </div>

                                        <div className="text-xs sm:text-sm text-[#1B2A41]/70 mt-1 space-y-0.5">

                                            <p>
                                                {selectedAddress.addressLine1}
                                            </p>

                                            {selectedAddress?.addressLine2 && (
                                                <p>
                                                    {selectedAddress.addressLine2}
                                                </p>
                                            )}

                                            {selectedAddress?.landmark && (
                                                <p>
                                                    {selectedAddress.landmark}
                                                </p>
                                            )}

                                            <p>
                                                {selectedAddress.district},{" "}
                                                {selectedAddress.state} -
                                                {selectedAddress.pincode}
                                            </p>

                                            <p className="mt-2 text-xs text-[#1B2A41]/50 font-medium">
                                                📞 {selectedAddress.mobileNumber}
                                            </p>

                                        </div>

                                    </div>

                                    <div className="flex gap-2">

                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="cursor-pointer border-[#1B2A41]/15 text-[#1B2A41] hover:bg-[#1B2A41]/5"
                                            onClick={() =>
                                                onEditAddress(
                                                    selectedAddress
                                                )
                                            }
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="text-red-500 border-[#1B2A41]/15 hover:bg-red-50 hover:border-red-200 cursor-pointer"
                                            onClick={() =>
                                                onDeleteAddress(
                                                    selectedAddress._id
                                                )
                                            }
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>

                                    </div>

                                </div>

                            </div>
                        )}

                        {/* VIEW 2: EXPANDED MODE (LIST SELECTOR VIEW) */}
                        {isExpanded && (
                            <div className="space-y-2.5 animate-fadeIn">
                                {addresses.map((address) => {
                                    const isCurrent = selectedAddressId === address._id;
                                    return (
                                        <button
                                            key={address._id}
                                            type="button"
                                            onClick={() => {
                                                onSelectAddress(address._id);
                                                setIsExpanded(false); // Auto close selection list
                                            }}
                                            className={`w-full text-left border rounded-2xl p-4 transition-all duration-150 flex items-start gap-3 cursor-pointer ${isCurrent
                                                ? "border-[#C6941E] bg-[#C6941E]/10"
                                                : "border-[#1B2A41]/10 hover:border-[#1B2A41]/25 bg-[#FBF8F1]"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="checkout-address-selection"
                                                checked={isCurrent}
                                                className="mt-1 accent-[#C6941E] h-4 w-4 shrink-0"
                                                readOnly
                                            />
                                            <div className="text-xs sm:text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[#1B2A41]">{address.fullName}</span>
                                                    {address.isDefault && (
                                                        <span className="text-[10px] bg-[#7A2A28]/10 text-[#7A2A28] px-1.5 py-0.5 rounded-md font-semibold">
                                                            🏠 Default Address
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[#1B2A41]/70 mt-1 space-y-0.5">
                                                    <p>{address.addressLine1}{address?.addressLine2 ? `, ${address?.addressLine2}` : ""}</p>
                                                    <p>{address.district}, {address.state} - {address.pincode}</p>
                                                    <p className="text-[#1B2A41]/50 font-medium text-xs mt-1">📞 {address.mobileNumber}</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
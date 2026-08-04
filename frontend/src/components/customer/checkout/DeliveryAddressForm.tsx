"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react"; // Import a loading spinner icon

import {
    CreateAddressInput,
    createAddressSchema,
} from "@/schemas/customer/address.schema";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button"; // Assuming you have a shadcn Button component
import { useCreateAddress, useUpdateAddress } from "@/hooks/customer/useAddress";
import { Address } from "@/types/customer/address.type";
import { useEffect } from "react";

interface DeliveryAddressFormProps {
    mode?: "create" | "edit";

    address?: Address | null;

    onSuccess?: () => void;
}
export default function DeliveryAddressForm({
    mode = "create",
    address,
    onSuccess,
}: DeliveryAddressFormProps) {
    const { mutate: createAddress, isPending } = useCreateAddress();
    const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress()

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateAddressInput>({
        resolver: zodResolver(createAddressSchema),
        defaultValues: {
            isDefault: false,
        }
    });

    useEffect(() => {
        if (
            mode === "edit" &&
            address
        ) {
            reset({
                fullName: address.fullName,
                mobileNumber: address.mobileNumber,
                pincode: address.pincode,
                addressLine1: address.addressLine1,
                addressLine2:
                    address.addressLine2 || "",
                landmark:
                    address.landmark || "",
                isDefault:
                    address.isDefault,
            });
        }
    }, [address, mode, reset]);

    const onSubmit = (data: CreateAddressInput) => {
        if (mode === "create") {
            createAddress(data, {
                onSuccess: () => {
                    reset();
                    onSuccess?.();
                },
            });
        } else if (mode === "edit" && address?._id) {
            updateAddress(
                { addressId: address._id, data },
                {
                    onSuccess: () => {
                        reset();
                        onSuccess?.();
                    },
                }
            );
        }
    };

    return (
        <Card className="rounded-3xl border bg-white shadow-sm overflow-hidden">
            <div className="h-1.5 bg-linear-to-r from-[#FF407D] via-[#FFB800] to-[#00A896]" />

            <CardContent className="p-5">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* HEADER */}
                    <div className="mb-4">
                        <h2 className="text-2xl font-black text-[#1D264F]">
                            Delivery Address
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Shipping details
                        </p>
                    </div>

                    {/* COMPACT GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                            label="Full Name"
                            placeholder="John Doe"
                            register={register("fullName")}
                            error={errors.fullName?.message}
                            disabled={isPending || isUpdating}
                        />

                        <Field
                            label="Mobile"
                            placeholder="9876543210"
                            register={register("mobileNumber")}
                            error={errors.mobileNumber?.message}
                            disabled={isPending || isUpdating}
                        />

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-[#1D264F]">
                                Pincode
                            </Label>

                            <Input
                                {...register("pincode")}
                                placeholder="416001"
                                className="h-12 rounded-xl border-neutral-200 bg-neutral-50 text-sm focus-visible:ring-[#FF407D]"
                            />

                            <p className="text-[11px] w-full text-slate-500">
                                Enter a valid pincode. District and State are automatically
                                fetched and verified for accurate delivery.
                            </p>

                            {errors.pincode && (
                                <p className="text-[11px] text-[#FF407D] font-medium">
                                    {errors.pincode.message}
                                </p>
                            )}
                        </div>

                        <div className="xl:col-span-2">
                            <Field
                                label="Address"
                                placeholder="House No, Street, Area"
                                register={register("addressLine1")}
                                error={errors.addressLine1?.message}
                                disabled={isPending || isUpdating}
                            />
                        </div>

                        <Field
                            label="Flat / Floor"
                            placeholder="Apartment / Floor"
                            register={register("addressLine2")}
                            error={errors.addressLine2?.message}
                            disabled={isPending || isUpdating}
                        />

                        <Field
                            label="Landmark"
                            placeholder="Near Bus Stand"
                            register={register("landmark")}
                            error={errors.landmark?.message}
                            disabled={isPending || isUpdating}
                        />
                    </div>

                    {/* SET AS DEFAULT CHECKBOX */}
                    <div className="mt-5 flex items-center gap-3">

                        <Controller
                            name="isDefault"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="isDefault"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isPending || isUpdating}
                                />
                            )}
                        />

                        <label
                            htmlFor="isDefault"
                            className="text-sm text-slate-600 font-medium cursor-pointer select-none"
                        >
                            Set as default address
                        </label>

                    </div>

                    {/* ACTIONS */}
                    <div className="mt-6">
                        <Button
                            type="submit"
                            disabled={isPending || isUpdating}
                            className="w-full h-12 rounded-xl font-bold transition-all cursor-pointer text-white bg-[#1D264F] hover:bg-[#1D264F]/90 disabled:opacity-70"
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Saving Address...
                                </span>
                            ) : (
                                "Save Address"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

type FieldProps = {
    label: string;
    placeholder: string;
    error?: string;
    register: any;
    disabled?: boolean;
};

function Field({
    label,
    placeholder,
    register,
    error,
    disabled,
}: FieldProps) {
    return (
        <div className="space-y-1">
            <Label className="text-xs font-bold text-[#1D264F]">
                {label}
            </Label>

            <Input
                {...register}
                placeholder={placeholder}
                disabled={disabled}
                className="
                  h-12
                  rounded-xl
                  border-neutral-200
                  bg-neutral-50
                  text-sm
                  focus-visible:ring-[#FF407D]
                  disabled:opacity-60
                "
            />

            {error && (
                <p className="text-[11px] text-[#FF407D] font-medium">
                    {error}
                </p>
            )}
        </div>
    );
}
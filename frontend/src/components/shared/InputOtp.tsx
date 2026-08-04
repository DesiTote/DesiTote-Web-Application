"use client"

import { REGEXP_ONLY_DIGITS } from "input-otp"

import { Field, FieldLabel } from "@/components/ui/field"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export function InputOTPPattern({ value, onChange }: Props) {
    return (
        <Field className="w-fit">
            <InputOTP id="digits-only"
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={value}
                onChange={onChange}>
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </InputOTP>
        </Field>
    )
}

export type OtpOperationType = "register" | "forgot" | "login" | "order" | "verifyEmail";

export const EMAIL_SUBJECTS = {
    register: "Verify your email • DesiTotes",
    forgot: "Reset your password • DesiTotes",
    login: "Your login verification code • DesiTotes",
    order: "Verify your order • DesiTotes",
    verifyEmail: "Verify your email • DesiTotes",

    welcome: "Welcome to the DesiTotes Family 🎉",
    passwordChanged: "Your password has been updated",
    orderConfirmed:"Your DesiTotes order is confirmed",
    orderDelivered: "Your DesiTotes order has been delivered 🎉",
    newsletter: "New arrivals are here ✨",
} as const;

export const OTP_EMAIL_CONTENT: Record<
    OtpOperationType,
    {
        title: string;
        description: string;
    }
> = {
    register: {
        title: "Verify your email",
        description:
            "Welcome to DesiTotes! Use the OTP below to verify your account.",
    },

    forgot: {
        title: "Reset your password",
        description:
            "Use the OTP below to securely reset your password.",
    },

    login: {
        title: "Login Verification",
        description:
            "Use the OTP below to securely sign in to your DesiTotes account.",
    },

    order: {
        title: "Verify your order",
        description:
            "Use the OTP below to verify and confirm your order.",
    },

    verifyEmail: {
        title: "Verify your email",
        description:
            "Use the OTP below to verify your new email address.",
    },
};
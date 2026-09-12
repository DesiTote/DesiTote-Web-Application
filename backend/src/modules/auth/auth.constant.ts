// These are functions, not constants, because NODE_ENV must be read at call
// time — a module-level read runs before dotenv populates process.env (see
// config/loadEnv.ts), which would silently drop `secure` from production
// cookies and send the auth token over plain HTTP.

type CookieOptions = {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "none" | "lax";
    path: string;
    maxAge?: number;
};

const isProduction = () => process.env.NODE_ENV === "production";

export const getBaseOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: isProduction(),
    sameSite: isProduction() ? "none" : "lax",
    path: "/",
});

export const getCookieOptions = (): CookieOptions => ({
    ...getBaseOptions(),
    maxAge: 24 * 60 * 60 * 1000,
});

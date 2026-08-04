export const baseOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    path: "/",
};

export const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
};
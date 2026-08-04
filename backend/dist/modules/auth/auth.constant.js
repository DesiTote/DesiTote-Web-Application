export const baseOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // ⬅️ must match what login set (was "strict" here, mismatch)
    path: "/",
};
//# sourceMappingURL=auth.constant.js.map
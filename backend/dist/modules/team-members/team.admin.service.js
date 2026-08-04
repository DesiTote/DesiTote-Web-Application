import bcrypt from "bcryptjs";
import { ApiError } from "../../utils/ApiError.js";
import { User, UserRole } from "../auth/auth.model.js";
export async function fetchTeamMembers() {
    const admins = await User.find({ role: UserRole.ADMIN })
        .select("fullName email mobileNumber emailVerified mobileVerified isAccountBlocked createdAt createdBy")
        .populate("createdBy", "fullName") // requires createdBy on the schema — see note below
        .sort({ createdAt: -1 })
        .lean();
    return admins.map((a) => ({
        _id: a._id.toString(),
        fullName: a.fullName,
        email: a.email,
        mobileNumber: a.mobileNumber,
        emailVerified: a.emailVerified,
        mobileVerified: a.mobileVerified,
        isAccountBlocked: a.isAccountBlocked,
        createdAt: a.createdAt,
        addedBy: a.createdBy
            ? { _id: a.createdBy._id.toString(), fullName: a.createdBy.fullName }
            : null,
    }));
}
/* ────────────────────────────────────────────────────────────
 * Create a new team member (ADMIN role).
 * `createdByAdminId` is the currently logged-in admin creating
 * this account — stored so the team list can show "added by X".
 * ──────────────────────────────────────────────────────────── */
export async function createTeamMember(payload) {
    const existing = await User.findOne({
        $or: [
            { email: payload.email.toLowerCase().trim() },
            { mobileNumber: payload.mobileNumber.trim() },
        ],
    });
    if (existing) {
        throw new ApiError(409, "An account with this email or mobile number already exists");
    }
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await User.create({
        fullName: payload.fullName.trim(),
        email: payload.email.toLowerCase().trim(),
        mobileNumber: payload.mobileNumber.trim(),
        password: hashedPassword,
        role: UserRole.ADMIN,
        emailVerified: false,
        mobileVerified: false,
        createdBy: payload.createdByAdminId,
    });
    return {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        emailVerified: user.emailVerified,
        mobileVerified: user.mobileVerified,
        isAccountBlocked: user.isAccountBlocked
    };
}
//# sourceMappingURL=team.admin.service.js.map
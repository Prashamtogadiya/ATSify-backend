import { Schema, model, Document } from "mongoose";

export const USER_ROLES = ["user", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    refreshToken?: string | null;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: USER_ROLES,
            default: "user",
            required: true,
        },
        refreshToken: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);

export default model<IUser>("User", userSchema);
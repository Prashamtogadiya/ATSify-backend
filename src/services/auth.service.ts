import User from "../models/User.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

/**
 * Registers a new user
 *
 * - Throws if user with email already exists
 * - Hashes the password before saving
 *
 * @param name - Full name of the user
 * @param email - Email address of the user
 * @param password - Plain text password of the user (Will be hashed before saving)
 * @returns The newly created user object
 * @throws {Error} If user with the given email already exists or DB error occurs
 */

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error("User already exists");

  const hash = await bcrypt.hash(
    password,
    Number(process.env.SALT_ROUND) || 10
  );
  const user = await User.create({ name, email, password: hash });
  return user;
};

/**
 * Validates user credentials
 * @param email - Email address of the user
 * @param password - Plain text password of the user
 * @returns The user object if credentials are valid
 * @throws {Error} If user is not found or credentials are invalid
 */
export const validateUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  return user;
};

/**
 * Generate a short-lived access token.
 *
 * @param userId - MongoDB user id as string.
 * @returns JWT access token (expires in 15 minutes).
 */
export const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, ACCESS_SECRET, { expiresIn: "15m" });
};

/**
 * Generate access and refresh tokens and persist the refresh token.
 *
 * @param userId - MongoDB user id as string.
 * @returns An object with accessToken and refreshToken.
 */
export const generateTokens = async (userId: string) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, {
    expiresIn: "7d",
  });
  await User.findByIdAndUpdate(userId.toString(), { refreshToken });
  return { accessToken, refreshToken };
};

/**
 * Verify a refresh token and return the associated user.
 *
 * - Confirms the token exists in DB and is cryptographically valid.
 *
 * @param refreshToken - Refresh token string stored in DB.
 * @returns The user document tied to the refresh token.
 * @throws {Error} When token is invalid or not found.
 */
export const verifyRefresh = async (refreshToken: string) => {
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("Invalid refresh token");

  jwt.verify(refreshToken, REFRESH_SECRET);
  return user;
};

/**
 * Log out a user by clearing their refresh token.
 *
 * @param refreshToken - The refresh token to revoke.
 */
export const logoutUser = async (refreshToken: string) => {
  const user = await User.findOne({ refreshToken });
  if (!user) return;
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
};

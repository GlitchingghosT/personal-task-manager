import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import User from "../models/userModel";
import { ApiError } from "../middleware/errorHandler";
import { signToken } from "../middleware/auth";

function publicUser(user: { _id: unknown; name: string; email: string }) {
  return { id: String(user._id), name: user.name, email: user.email };
}

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) {
    throw new ApiError(409, "CONFLICT", "An account with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await User.create({ name, email, password: passwordHash });
    return res.status(201).json({ user: publicUser(user), token: signToken(String(user._id)) });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      throw new ApiError(409, "CONFLICT", "An account with that email already exists.");
    }
    throw error;
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "UNAUTHENTICATED", "Invalid email or password.");
  }
  return res.json({ user: publicUser(user), token: signToken(String(user._id)) });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication is required.");
  }
  return res.json({ user: publicUser(user) });
}

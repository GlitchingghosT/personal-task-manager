import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import User from "../models/userModel";
import { ApiError } from "./errorHandler";

const tokenIssuer = "taskduty-api";
const tokenAudience = "taskduty-web";

declare global {
  namespace Express {
    interface Request {
      userId?: Types.ObjectId;
    }
  }
}

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
  return secret;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, jwtSecret(), {
    expiresIn: "1h",
    algorithm: "HS256",
    issuer: tokenIssuer,
    audience: tokenAudience,
  });
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.header("authorization");
  if (!authorization?.startsWith("Bearer ") || authorization.slice(7).trim() === "") {
    return next(new ApiError(401, "UNAUTHENTICATED", "Authentication is required."));
  }

  try {
    const payload = jwt.verify(authorization.slice(7).trim(), jwtSecret(), {
      algorithms: ["HS256"],
      issuer: tokenIssuer,
      audience: tokenAudience,
    });
    if (typeof payload === "string" || typeof payload.sub !== "string" || !Types.ObjectId.isValid(payload.sub)) {
      throw new Error("Invalid token subject");
    }
    const userId = new Types.ObjectId(payload.sub);
    if (!(await User.exists({ _id: userId }))) {
      throw new Error("User no longer exists");
    }
    req.userId = userId;
    return next();
  } catch {
    return next(new ApiError(401, "UNAUTHENTICATED", "Authentication is required."));
  }
}

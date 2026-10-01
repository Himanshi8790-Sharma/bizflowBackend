import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  verifyToken,
} from "../lib/auth.js";

import type {
  AuthPayload,
} from "../lib/auth.js";

export interface AuthRequest
  extends Request {
  user?: AuthPayload;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.bizflow_token;

    if (!token) {
      return res.status(401).json({
        message:
          "Authentication required",
      });
    }

    const payload =
      await verifyToken(token);

    req.user = payload;

    next();
  } catch (error) {
    console.error(
      "AUTH_MIDDLEWARE_ERROR:",
      error
    );

    return res.status(401).json({
      message:
        "Invalid or expired session",
    });
  }
}
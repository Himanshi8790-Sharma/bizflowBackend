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

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.bizflow_token;

    if (!token) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const payload = await verifyToken(token);

    req.user = payload;

    next();
  } catch (error) {
    console.error(
      "AUTH_MIDDLEWARE_ERROR:",
      error
    );

    res.status(401).json({
      message: "Invalid or expired session",
    });
  }
}
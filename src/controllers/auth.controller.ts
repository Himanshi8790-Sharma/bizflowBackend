import type { Request, Response } from "express";
import bcrypt from "bcrypt";

import { prisma } from "../lib/prisma.js";
import { createToken } from "../lib/auth.js";

const COOKIE_NAME = "bizflow_token";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export async function register(
  req: Request,
  res: Response
) {
  try {
    const {
      organizationName,
      name,
      email,
      password,
    } = req.body;

    // -------------------------
    // Validation
    // -------------------------

    if (
      typeof organizationName !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message:
          "Organization name, name, email and password are required",
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedName = name.trim();
    const normalizedOrganizationName =
      organizationName.trim();

    if (
      !normalizedEmail ||
      !normalizedName ||
      !normalizedOrganizationName
    ) {
      return res.status(400).json({
        message: "Invalid registration details",
      });
    }

   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "A valid email is required",
      });
    }

    // -------------------------
    // Check existing user
    // -------------------------

    const existingUser =
      await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "User with this email already exists",
      });
    }

    // -------------------------
    // Hash password
    // -------------------------

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    // -------------------------
    // Create organization + user
    // -------------------------

    const result = await prisma.$transaction(
      async (tx) => {
        const organization =
          await tx.organization.create({
            data: {
              name: normalizedOrganizationName,
            },
          });

        const user = await tx.user.create({
          data: {
            organizationId: organization.id,
            name: normalizedName,
            email: normalizedEmail,
            passwordHash,
            role: "ADMIN",
          },
        });

        return {
          organization,
          user,
        };
      }
    );

    // -------------------------
    // Create JWT
    // -------------------------

    const token = await createToken({
      userId: result.user.id,
      organizationId: result.organization.id,
      role: result.user.role,
    });

    // -------------------------
    // Set cookie
    // -------------------------

    res.cookie(
      COOKIE_NAME,
      token,
      cookieOptions
    );

    // -------------------------
    // Response
    // -------------------------

    return res.status(201).json({
      message: "Registration successful",

      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },

      organization: {
        id: result.organization.id,
        name: result.organization.name,
      },
    });
  } catch (error) {
    console.error(
      "REGISTER_ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong during registration",
    });
  }
}

export async function login(
  req: Request,
  res: Response
) {
  try {
    const { email, password } = req.body;

    // -------------------------
    // Validation
    // -------------------------

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // -------------------------
    // Find user
    // -------------------------

    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        isActive: true,
      },

      include: {
        organization: true,
      },
    });
    console.log("USER FOUND:", !!user);

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    // -------------------------
    // Check organization
    // -------------------------

    if (!user.organization.isActive) {
      return res.status(403).json({
        message:
          "Organization is inactive",
      });
    }
    

    // -------------------------
    // Verify password
    // -------------------------

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.passwordHash
      );
      console.log("PASSWORD MATCH:", passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    // -------------------------
    // Create JWT
    // -------------------------

    const token = await createToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });

    // -------------------------
    // Set cookie
    // -------------------------

    res.cookie(
      COOKIE_NAME,
      token,
      cookieOptions
    );

    // -------------------------
    // Response
    // -------------------------

    return res.status(200).json({
      message: "Login successful",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },

      organization: {
        id: user.organization.id,
        name: user.organization.name,
      },
    });
  } catch (error) {
    console.error(
      "LOGIN_ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong during login",
    });
  }
}

export async function logout(
  _req: Request,
  res: Response
) {
  try {
    res.clearCookie(
      COOKIE_NAME,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      }
    );

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error(
      "LOGOUT_ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong during logout",
    });
  }
}


export async function getMe(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: req.user.userId,
        organizationId: req.user.organizationId,
        isActive: true,
      },
      include: {
        organization: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (!user.organization.isActive) {
      return res.status(403).json({
        message: "Organization is inactive",
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
      },
    });
  } catch (error) {
    console.error("GET_ME_ERROR:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}
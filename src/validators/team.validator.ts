import { z } from "zod";

export const createInvitationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  role: z.enum(["MANAGER", "EMPLOYEE"]),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8).max(72),
});

export const updateTeamRoleSchema = z.object({
  role: z.enum(["MANAGER", "EMPLOYEE"]),
});
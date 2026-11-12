import { z } from "zod";

export const createTeamMemberSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  role: z.enum(["MANAGER", "EMPLOYEE"]),
});

export const updateTeamRoleSchema = z.object({
  role: z.enum(["MANAGER", "EMPLOYEE"]),
});
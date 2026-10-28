import type { Request, Response } from "express";
import { ZodError } from "zod";
import teamService from "../services/team.service.js";
import { acceptInvitationSchema, createInvitationSchema, updateTeamRoleSchema } from "../validators/team.validator.js";


export const teamController = {
  // POST /api/team/invitations
  async createInvitation(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const input = createInvitationSchema.parse(req.body);

      const invitation = await teamService.createInvitation(
        user.organizationId,
        user.userId,
        input,
      );

      res.status(201).json({
        success: true,
        message: "Invitation sent successfully",
        data: invitation,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid invitation data",
          errors: error.issues,
        });
        return;
      }

      const message =
        error instanceof Error ? error.message : "Failed to send invitation";

      const status =
        message.includes("Only ADMIN") ? 403 :
        message.includes("already exists") ? 409 :
        message.includes("active invitation") ? 409 :
        message.includes("Organization not found") ? 404 : 500;

      res.status(status).json({ success: false, message });
    }
  },

  // POST /api/team/invitations/accept
  async acceptInvitation(req: Request, res: Response): Promise<void> {
    try {
      const input = acceptInvitationSchema.parse(req.body);
      const user = await teamService.acceptInvitation(input);

      res.status(201).json({
        success: true,
        message: "Invitation accepted successfully",
        data: user,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid invitation data",
          errors: error.issues,
        });
        return;
      }

      const message =
        error instanceof Error ? error.message : "Failed to accept invitation";

      const status =
        message.includes("already exists") ? 409 :
        message.includes("Invalid invitation") ||
        message.includes("expired") ||
        message.includes("revoked") ||
        message.includes("already accepted") ||
        message.includes("no longer valid") ? 400 :
        message.includes("Organization not found") ? 404 : 500;

      res.status(status).json({ success: false, message });
    }
  },

  // GET /api/team
  async listMembers(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const members = await teamService.listMembers(user.organizationId);

      res.status(200).json({
        success: true,
        data: members,
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Failed to fetch team members",
      });
    }
  },

  // PATCH /api/team/:memberId/role
  async updateMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

     const memberId = req.params.memberId;

if (typeof memberId !== "string" || !memberId) {
  res.status(400).json({
    success: false,
    message: "Valid member ID is required",
  });
  return;
}

      const { role } = updateTeamRoleSchema.parse(req.body);

      const member = await teamService.updateMemberRole(
        user.organizationId,
        memberId,
        role,
      );

      res.status(200).json({
        success: true,
        message: "Team member role updated successfully",
        data: member,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid role",
          errors: error.issues,
        });
        return;
      }

      const message =
        error instanceof Error ? error.message : "Failed to update role";

      const status =
        message.includes("Cannot change ADMIN") ? 403 :
        message.includes("not found") ? 404 : 500;

      res.status(status).json({ success: false, message });
    }
  },

  // DELETE /api/team/:memberId
  async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

     const memberId = req.params.memberId;

if (typeof memberId !== "string" || !memberId) {
  res.status(400).json({
    success: false,
    message: "Valid member ID is required",
  });
  return;
}

      const member = await teamService.removeMember(
        user.organizationId,
        memberId,
      );

      res.status(200).json({
        success: true,
        message: "Team member removed successfully",
        data: member,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove team member";

      const status =
        message.includes("Cannot remove ADMIN") ? 403 :
        message.includes("not found") ? 404 :
        message.includes("already inactive") ? 409 : 500;

      res.status(status).json({ success: false, message });
    }
  },
};
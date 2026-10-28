import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { prisma } from "../lib/prisma.js";

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const teamService = {
  async createInvitation(
    organizationId: string,
    invitedById: string,
    input: { name: string; email: string; role: "MANAGER" | "EMPLOYEE" },
  ) {
    const email = input.email.trim().toLowerCase();

    const inviter = await prisma.user.findFirst({
      where: {
        id: invitedById,
        organizationId,
        role: "ADMIN",
        isActive: true,
      },
    });

    if (!inviter) {
      throw new Error("Only ADMIN can invite team members");
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    if (!organization) throw new Error("Organization not found");

    const existingUser = await prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        organizationId,
        email,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      throw new Error("An active invitation already exists");
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const invitation = await prisma.teamInvitation.create({
      data: {
        organizationId,
        invitedById,
        name: input.name.trim(),
        email,
        role: input.role,
        tokenHash,
        expiresAt,
      },
    });

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: Number(process.env.SMTP_PORT || 465) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const frontendUrl = (
        process.env.FRONTEND_URL || "http://localhost:3000"
      ).replace(/\/$/, "");

      const invitationUrl =
        `${frontendUrl}/accept-invitation?token=${token}`;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `Invitation to join ${organization.name} on BizFlow`,
        text: `Hello ${input.name}, you have been invited to join ${organization.name} as ${input.role}. Accept your invitation here: ${invitationUrl}. This link expires in 24 hours.`,
      });
    } catch (error) {
      await prisma.teamInvitation.update({
        where: { id: invitation.id },
        data: { revokedAt: new Date() },
      });

      throw error;
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      message: "Invitation sent successfully",
    };
  },

  async acceptInvitation(input: { token: string; password: string }) {
    const invitation = await prisma.teamInvitation.findUnique({
      where: { tokenHash: hashToken(input.token) },
    });

    if (!invitation) throw new Error("Invalid invitation");
    if (invitation.acceptedAt) {
      throw new Error("Invitation already accepted");
    }
    if (invitation.revokedAt) {
      throw new Error("Invitation has been revoked");
    }
    if (invitation.expiresAt <= new Date()) {
      throw new Error("Invitation has expired");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    return prisma.$transaction(async (tx) => {
      const claimed = await tx.teamInvitation.updateMany({
        where: {
          id: invitation.id,
          acceptedAt: null,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { acceptedAt: new Date() },
      });

      if (claimed.count !== 1) {
        throw new Error("Invitation is no longer valid");
      }

      const organization = await tx.organization.findUnique({
        where: { id: invitation.organizationId },
        select: { id: true },
      });

      if (!organization) throw new Error("Organization not found");

      const existingUser = await tx.user.findFirst({
        where: { email: invitation.email },
        select: { id: true },
      });

      if (existingUser) {
        throw new Error("A user with this email already exists");
      }

      return tx.user.create({
        data: {
          organizationId: invitation.organizationId,
          name: invitation.name,
          email: invitation.email,
          passwordHash,
          role: invitation.role,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          organizationId: true,
        },
      });
    });
  },

  async listMembers(organizationId: string) {
    return prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
  },

  async updateMemberRole(
    organizationId: string,
    memberId: string,
    role: "MANAGER" | "EMPLOYEE",
  ) {
    const member = await prisma.user.findFirst({
      where: { id: memberId, organizationId },
      select: { id: true, role: true },
    });

    if (!member) throw new Error("Team member not found");
    if (member.role === "ADMIN") {
      throw new Error("Cannot change ADMIN role");
    }

    return prisma.user.update({
      where: { id: member.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  },

  async removeMember(organizationId: string, memberId: string) {
    const member = await prisma.user.findFirst({
      where: { id: memberId, organizationId },
      select: { id: true, role: true, isActive: true },
    });

    if (!member) throw new Error("Team member not found");
    if (member.role === "ADMIN") {
      throw new Error("Cannot remove ADMIN");
    }
    if (!member.isActive) {
      throw new Error("Member is already inactive");
    }

    return prisma.user.update({
      where: { id: member.id },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  },
};

export default teamService;
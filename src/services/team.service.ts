
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const teamService = {
  // CREATE TEAM MEMBER
  async createMember(
    organizationId: string,
    adminId: string,
    input: {
      name: string;
      email: string;
      password: string;
      role: "MANAGER" | "EMPLOYEE";
    },
  ) {
    const email = input.email.trim().toLowerCase();

    // Verify ADMIN
    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        organizationId,
        role: "ADMIN",
        isActive: true,
      },
    });

    if (!admin) {
      throw new Error("Only ADMIN can create team members");
    }

    // Check organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    // Check existing email in same organization
    const existingUser = await prisma.user.findFirst({
      where: {
        organizationId,
        email,
      },
    });

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Create member
    return prisma.user.create({
      data: {
        organizationId,
        name: input.name.trim(),
        email,
        passwordHash,
        role: input.role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        isActive: true,
        createdAt: true,
      },
    });
  },

  // GET TEAM MEMBERS
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

  // UPDATE MEMBER ROLE
  async updateMemberRole(
    organizationId: string,
    memberId: string,
    role: "MANAGER" | "EMPLOYEE",
  ) {
    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        organizationId,
      },
      select: { id: true, role: true },
    });

    if (!member) {
      throw new Error("Team member not found");
    }

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

  // REMOVE TEAM MEMBER
  async removeMember(
    organizationId: string,
    memberId: string,
  ) {
    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        organizationId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!member) {
      throw new Error("Team member not found");
    }

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

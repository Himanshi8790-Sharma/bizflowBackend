
import { Router } from "express";

import { teamController } from "../controllers/team.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

import { authorizeRoles } from "../middleware/rbac.middleware.js";

const router = Router();

// CREATE TEAM MEMBER
router.post(
  "/members",
  requireAuth,
  authorizeRoles("ADMIN"),
  teamController.createMember,
);

// GET TEAM MEMBERS
router.get(
  "/",
  requireAuth,
  authorizeRoles("ADMIN"),
  teamController.listMembers,
);

// UPDATE ROLE
router.patch(
  "/:memberId/role",
  requireAuth,
  authorizeRoles("ADMIN"),
  teamController.updateMemberRole,
);

// REMOVE MEMBER
router.delete(
  "/:memberId",
  requireAuth,
  authorizeRoles("ADMIN"),
  teamController.removeMember,
);

export default router;

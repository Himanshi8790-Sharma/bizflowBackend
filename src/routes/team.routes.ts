import { Router } from "express";
import { teamController } from "../controllers/team.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/rbac.middleware.js";

const router = Router();

router.post(
  "/invitations/accept",
  teamController.acceptInvitation,
);

router.post(
  "/invitations",
  requireAuth,
  authorizeRoles("ADMIN"),
  teamController.createInvitation,
);

router.get(
  "/",
  requireAuth,
  authorizeRoles("ADMIN"),
  teamController.listMembers,
);

router.patch(
  "/:memberId/role",
  requireAuth,
  authorizeRoles("ADMIN"),
  teamController.updateMemberRole,
);

router.delete(
  "/:memberId",
  requireAuth,
  authorizeRoles("ADMIN"),
  teamController.removeMember,
);

export default router;
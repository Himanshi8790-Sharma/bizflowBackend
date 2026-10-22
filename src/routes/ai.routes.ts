import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { aiController } from "../controllers/ai.controller.js";

const router = Router();

// All AI routes require authentication
router.use(requireAuth);

// POST /api/ai/query
router.post("/query", aiController.askQuestion);

export default router;
import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";

import {
  getSummary,
  getRevenueTrend,
  getTopProducts,
  getOrderStatusDistribution,
  getExpensesByCategory,
} from "../controllers/analytics.controller.js";

const router = Router();

router.get("/summary", requireAuth, getSummary);

router.get("/revenue-trend", requireAuth, getRevenueTrend);

router.get("/top-products", requireAuth, getTopProducts);

router.get("/order-status", requireAuth, getOrderStatusDistribution);

router.get("/expenses-by-category", requireAuth, getExpensesByCategory);

export default router;

// import { Router } from "express";

// import { requireAuth } from "../middleware/auth.middleware.js";

// import {
//   getSummary,
//   getRevenueTrend,
//   getTopProducts,
//   getOrderStatusDistribution,
//   getExpensesByCategory,
// } from "../controllers/analytics.controller.js";

// const router = Router();

// router.get("/summary", requireAuth, getSummary);

// router.get("/revenue-trend", requireAuth, getRevenueTrend);

// router.get("/top-products", requireAuth, getTopProducts);

// router.get("/order-status", requireAuth, getOrderStatusDistribution);

// router.get("/expenses-by-category", requireAuth, getExpensesByCategory);

// export default router;
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

// All analytics routes require authentication
router.use(requireAuth);

router.get("/summary", getSummary);
router.get("/revenue-trend", getRevenueTrend);
router.get("/top-products", getTopProducts);
router.get("/order-status", getOrderStatusDistribution);
router.get("/expenses-by-category", getExpensesByCategory);

export default router;
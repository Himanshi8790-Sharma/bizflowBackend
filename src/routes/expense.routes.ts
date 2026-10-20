import { Router } from "express";

import { expenseController } from "../controllers/expense.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/rbac.middleware.js";

const router = Router();

router.use(requireAuth);

// Only ADMIN can access expenses
router.use(authorizeRoles("ADMIN"));

router.post("/", expenseController.createExpense);

router.get("/", expenseController.getExpenses);

router.get("/:id", expenseController.getExpenseById);

router.patch("/:id", expenseController.updateExpense);

router.delete("/:id", expenseController.deleteExpense);

export default router;
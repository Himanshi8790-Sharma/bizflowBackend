import { Router } from "express";

import { customerController } from "../controllers/customer.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/rbac.middleware.js";

const router = Router();

// All customer routes require authentication
router.use(requireAuth);

// GET /api/customers — All roles can view customers
router.get(
  "/",
  authorizeRoles("ADMIN", "MANAGER", "EMPLOYEE"),
  customerController.getCustomers,
);

// GET /api/customers/:id — All roles can view a customer
router.get(
  "/:id",
  authorizeRoles("ADMIN", "MANAGER", "EMPLOYEE"),
  customerController.getCustomerById,
);

// POST /api/customers — Admin and Manager can create customers
router.post(
  "/",
  authorizeRoles("ADMIN", "MANAGER"),
  customerController.createCustomer,
);

// PATCH /api/customers/:id — Admin and Manager can update customers
router.patch(
  "/:id",
  authorizeRoles("ADMIN", "MANAGER"),
  customerController.updateCustomer,
);

// DELETE /api/customers/:id — Only Admin can delete customers
router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  customerController.deleteCustomer,
);

export default router;
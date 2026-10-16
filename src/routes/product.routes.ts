import { Router } from "express";

import { productController } from "../controllers/product.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/rbac.middleware.js";

const router = Router();

// All product routes require authentication
router.use(requireAuth);

// GET /api/products — All roles can view products
router.get(
  "/",
  authorizeRoles("ADMIN", "MANAGER", "EMPLOYEE"),
  productController.getProducts,
);

// GET /api/products/:id — All roles can view a single product
router.get(
  "/:id",
  authorizeRoles("ADMIN", "MANAGER", "EMPLOYEE"),
  productController.getProductById,
);

// POST /api/products — Admin and Manager can create products
router.post(
  "/",
  authorizeRoles("ADMIN", "MANAGER"),
  productController.createProduct,
);

// PATCH /api/products/:id — Admin and Manager can update products
router.patch(
  "/:id",
  authorizeRoles("ADMIN", "MANAGER"),
  productController.updateProduct,
);

// DELETE /api/products/:id — Only Admin can delete products
router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  productController.deleteProduct,
);

export default router;
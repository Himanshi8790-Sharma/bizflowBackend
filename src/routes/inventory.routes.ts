import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { inventoryController } from "../controllers/inventory.controller.js";

const router = Router();

// All inventory routes require authentication
router.use(requireAuth);

// Inventory summary
router.get("/summary", inventoryController.getInventorySummary);

// All inventory products
router.get("/", inventoryController.getInventory);

// Low-stock products
router.get("/low-stock", inventoryController.getLowStockProducts);

// Inventory movement history
router.get("/movements", inventoryController.getMovementHistory);

// Adjust product stock
router.patch("/:productId/adjust", inventoryController.adjustStock);

export default router;
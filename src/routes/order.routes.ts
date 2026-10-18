import { Router } from "express";

import { orderController } from "../controllers/order.controller.js";
import {  requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// All order routes require authentication
router.use(requireAuth);

// Create a new order
router.post("/", orderController.createOrder);

// Get all orders
router.get("/", orderController.getOrders);

// Get a single order by ID
router.get("/:id", orderController.getOrderById);

// Update order status
router.patch("/:id/status", orderController.updateOrderStatus);

// Cancel an order
router.post("/:id/cancel", orderController.cancelOrder);

export default router;
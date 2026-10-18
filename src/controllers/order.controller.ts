import type { Request, Response } from "express";
import { ZodError } from "zod";

import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order.validator.js";
import orderService from "../services/order.service.js";

export const orderController = {
  // POST /api/orders
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const data = createOrderSchema.parse(req.body);

      const order = await orderService.createOrder(
        data,
        user.organizationId,
        user.userId,
      );

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues,
        });
        return;
      }

      console.error("CREATE_ORDER_ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to create order",
      });
    }
  },

  // GET /api/orders
  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const orders = await orderService.getOrders(
        user.organizationId,
      );

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error("GET_ORDERS_ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }
  },

  // GET /api/orders/:id
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const orderId = req.params.id;

if (typeof orderId !== "string" || !orderId) {
  res.status(400).json({
    success: false,
    message: "Invalid order ID",
  });
  return;
}

      const order = await orderService.getOrderById(
        orderId,
        user.organizationId,
      );

      if (!order) {
        res.status(404).json({
          success: false,
          message: "Order not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("GET_ORDER_ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch order",
      });
    }
  },

  // PATCH /api/orders/:id/status
  async updateOrderStatus(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

     const orderId = req.params.id;

if (typeof orderId !== "string" || !orderId) {
  res.status(400).json({
    success: false,
    message: "Invalid order ID",
  });
  return;
}

      const data = updateOrderStatusSchema.parse(req.body);

      const order = await orderService.updateOrderStatus(
        orderId,
        user.organizationId,
        data,
      );

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues,
        });
        return;
      }

      console.error("UPDATE_ORDER_STATUS_ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update order status",
      });
    }
  },

  // POST /api/orders/:id/cancel
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }
const orderId = req.params.id;

if (typeof orderId !== "string" || !orderId) {
  res.status(400).json({
    success: false,
    message: "Invalid order ID",
  });
  return;
}

      const order = await orderService.cancelOrder(
        orderId,
        user.organizationId,
      );

      res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        data: order,
      });
    } catch (error) {
      console.error("CANCEL_ORDER_ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to cancel order",
      });
    }
  },
};
import type { Request, Response } from "express";
import { ZodError } from "zod";
import { inventoryService } from "../services/inventory.service.js";


export const inventoryController = {
  // GET /api/inventory/summary
  async getInventorySummary(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const summary = await inventoryService.getInventorySummary(
        user.organizationId,
      );

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error("Get inventory summary error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch inventory summary",
      });
    }
  },

  // GET /api/inventory
  async getInventory(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const inventory = await inventoryService.getInventory(
        user.organizationId,
      );

      res.status(200).json({
        success: true,
        data: inventory,
      });
    } catch (error) {
      console.error("Get inventory error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch inventory",
      });
    }
  },

  // GET /api/inventory/low-stock
  async getLowStockProducts(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const products = await inventoryService.getLowStockProducts(
        user.organizationId,
      );

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Get low-stock products error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch low-stock products",
      });
    }
  },

  // GET /api/inventory/movements?productId=...
  async getMovementHistory(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const productId =
        typeof req.query.productId === "string"
          ? req.query.productId
          : undefined;

      const movements = await inventoryService.getMovementHistory(
        user.organizationId,
        productId,
      );

      res.status(200).json({
        success: true,
        data: movements,
      });
    } catch (error) {
      console.error("Get inventory movements error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch inventory movement history",
      });
    }
  },

  // PATCH /api/inventory/:productId/adjust
  async adjustStock(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const productId = req.params.productId;

      if (!productId || typeof productId !== "string") {
        res.status(400).json({
          success: false,
          message: "Valid product ID is required",
        });
        return;
      }

      const { quantity, type, reason } = req.body;

      if (
        typeof quantity !== "number" ||
        !Number.isSafeInteger(quantity) ||
        quantity <= 0
      ) {
        res.status(400).json({
          success: false,
          message: "Quantity must be a positive integer",
        });
        return;
      }

      const allowedTypes = [
        "INCREASE",
        "DECREASE",
        "RESTOCK",
        "RETURN",
        "ADJUSTMENT",
      ];

      if (typeof type !== "string" || !allowedTypes.includes(type)) {
        res.status(400).json({
          success: false,
          message: "Invalid inventory movement type",
        });
        return;
      }

      if (
        reason !== undefined &&
        reason !== null &&
        typeof reason !== "string"
      ) {
        res.status(400).json({
          success: false,
          message: "Reason must be a string",
        });
        return;
      }

      const result = await inventoryService.adjustStock(
        user.organizationId,
        productId,
        user.userId,
        quantity,
        type as
          | "INCREASE"
          | "DECREASE"
          | "SALE"
          | "RESTOCK"
          | "RETURN"
          | "ADJUSTMENT",
        reason || undefined,
      );

      res.status(200).json({
        success: true,
        message: "Inventory stock updated successfully",
        data: result,
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

      if (error instanceof Error) {
        if (error.message === "PRODUCT_NOT_FOUND") {
          res.status(404).json({
            success: false,
            message: "Product not found",
          });
          return;
        }

        if (error.message === "INSUFFICIENT_STOCK") {
          res.status(400).json({
            success: false,
            message: "Insufficient stock available",
          });
          return;
        }

        if (error.message === "STOCK_UPDATE_CONFLICT") {
          res.status(409).json({
            success: false,
            message: "Stock was updated by another request. Please retry.",
          });
          return;
        }

        if (error.message === "Quantity must be a positive integer") {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      console.error("Adjust inventory stock error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update inventory stock",
      });
    }
  },
};
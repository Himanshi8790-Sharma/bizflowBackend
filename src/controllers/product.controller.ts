import type { Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

import { productService } from "../services/product.service.js";
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from "../validators/product.validator.js";

export const productController = {
  // POST /api/products
  async createProduct(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const data = createProductSchema.parse(req.body);

      const product = await productService.createProduct(
        user.organizationId,
        data,
      );

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues,
        });
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return res.status(409).json({
          success: false,
          message: "A product with this SKU already exists",
        });
      }

      console.error("Create product error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create product",
      });
    }
  },

  // GET /api/products
  async getProducts(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 10);

      if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Page must be a positive integer and limit must be between 1 and 100",
        });
      }

      const result = await productService.getProducts(
        user.organizationId,
        page,
        limit,
      );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Get products error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }
  },

  // GET /api/products/:id
  async getProductById(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { id } = productIdSchema.parse(req.params);

      const product = await productService.getProductById(
        user.organizationId,
        id,
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
          errors: error.issues,
        });
      }

      console.error("Get product error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch product",
      });
    }
  },

  // PATCH /api/products/:id
  async updateProduct(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { id } = productIdSchema.parse(req.params);
      const data = updateProductSchema.parse(req.body);

      const product = await productService.updateProduct(
        user.organizationId,
        id,
        data,
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues,
        });
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return res.status(409).json({
          success: false,
          message: "A product with this SKU already exists",
        });
      }

      console.error("Update product error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    }
  },

  // DELETE /api/products/:id
  async deleteProduct(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { id } = productIdSchema.parse(req.params);

      const deleted = await productService.deleteProduct(
        user.organizationId,
        id,
      );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
          errors: error.issues,
        });
      }

      console.error("Delete product error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete product",
      });
    }
  },
};
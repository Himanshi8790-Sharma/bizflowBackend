import type { Request, Response } from "express";
import { ZodError } from "zod";

import { customerService } from "../services/customer.service.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdSchema,
} from "../validators/customer.validator.js";

export const customerController = {
  // POST /api/customers
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const data = createCustomerSchema.parse(req.body);

      const customer = await customerService.createCustomer(
        user.organizationId,
        data,
      );

      res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
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

      console.error("CREATE_CUSTOMER_ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to create customer",
      });
    }
  },

  // GET /api/customers
  async getCustomers(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const pageValue = req.query.page;
      const limitValue = req.query.limit;

      const page = pageValue === undefined ? 1 : Number(pageValue);
      const limit = limitValue === undefined ? 10 : Number(limitValue);

      if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
      ) {
        res.status(400).json({
          success: false,
          message: "Page must be >= 1 and limit must be between 1 and 100",
        });
        return;
      }

      const result = await customerService.getCustomers(
        user.organizationId,
        page,
        limit,
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("GET_CUSTOMERS_ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch customers",
      });
    }
  },

  // GET /api/customers/:id
  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const { id } = customerIdSchema.parse(req.params);

      const customer = await customerService.getCustomerById(
        user.organizationId,
        id,
      );

      if (!customer) {
        res.status(404).json({
          success: false,
          message: "Customer not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid customer ID",
          errors: error.issues,
        });
        return;
      }

      console.error("GET_CUSTOMER_ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch customer",
      });
    }
  },

  // PATCH /api/customers/:id
  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const { id } = customerIdSchema.parse(req.params);
      const data = updateCustomerSchema.parse(req.body);

      const customer = await customerService.updateCustomer(
        user.organizationId,
        id,
        data,
      );

      if (!customer) {
        res.status(404).json({
          success: false,
          message: "Customer not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: customer,
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

      console.error("UPDATE_CUSTOMER_ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update customer",
      });
    }
  },

  // DELETE /api/customers/:id
  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const { id } = customerIdSchema.parse(req.params);

      const deleted = await customerService.deleteCustomer(
        user.organizationId,
        id,
      );

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Customer not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Customer deleted successfully",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid customer ID",
          errors: error.issues,
        });
        return;
      }

      console.error("DELETE_CUSTOMER_ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete customer",
      });
    }
  },
};
import type { Request, Response } from "express";
import { ZodError } from "zod";

import { createExpenseSchema, updateExpenseSchema } from "../validators/expense.validator.js";
import { expenseService } from "../services/expense.service.js";

export const expenseController = {
  async createExpense(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const data = createExpenseSchema.parse(req.body);

      const expense = await expenseService.createExpense(
        data,
        user.organizationId,
        user.userId,
      );

      res.status(201).json({
        message: "Expense created successfully",
        expense,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation failed",
          errors: error.issues,
        });
        return;
      }

      console.error("Create expense error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getExpenses(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const expenses = await expenseService.getExpenses(user.organizationId);

      res.status(200).json({ expenses });
    } catch (error) {
      console.error("Get expenses error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getExpenseById(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const id = req.params.id;

      if (typeof id !== "string") {
        res.status(400).json({ message: "Invalid expense ID" });
        return;
      }

      const expense = await expenseService.getExpenseById(
        id,
        user.organizationId,
      );

      if (!expense) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }

      res.status(200).json({ expense });
    } catch (error) {
      console.error("Get expense error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async updateExpense(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const id = req.params.id;

      if (typeof id !== "string") {
        res.status(400).json({ message: "Invalid expense ID" });
        return;
      }

      const data = updateExpenseSchema.parse(req.body);

      const expense = await expenseService.updateExpense(
        id,
        user.organizationId,
        data,
      );

      if (!expense) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }

      res.status(200).json({
        message: "Expense updated successfully",
        expense,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation failed",
          errors: error.issues,
        });
        return;
      }

      console.error("Update expense error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async deleteExpense(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const id = req.params.id;

      if (typeof id !== "string") {
        res.status(400).json({ message: "Invalid expense ID" });
        return;
      }

      const expense = await expenseService.deleteExpense(
        id,
        user.organizationId,
      );

      if (!expense) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }

      res.status(200).json({
        message: "Expense deleted successfully",
      });
    } catch (error) {
      console.error("Delete expense error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
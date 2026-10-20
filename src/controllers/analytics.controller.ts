import type { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service.js";

export const getSummary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const summary = await analyticsService.getSummary(
      req.user.organizationId,
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Get analytics summary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics summary",
    });
  }
};

export const getRevenueTrend = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const revenueTrend = await analyticsService.getRevenueTrend(
      req.user.organizationId,
    );

    res.status(200).json({
      success: true,
      data: revenueTrend,
    });
  } catch (error) {
    console.error("Get revenue trend error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue trend",
    });
  }
};

export const getTopProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const topProducts = await analyticsService.getTopProducts(
      req.user.organizationId,
    );

    res.status(200).json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    console.error("Get top products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch top products",
    });
  }
};

export const getOrderStatusDistribution = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const orderStatusDistribution =
      await analyticsService.getOrderStatusDistribution(
        req.user.organizationId,
      );

    res.status(200).json({
      success: true,
      data: orderStatusDistribution,
    });
  } catch (error) {
    console.error("Get order status distribution error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order status distribution",
    });
  }
};

export const getExpensesByCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const expensesByCategory =
      await analyticsService.getExpensesByCategory(
        req.user.organizationId,
      );

    res.status(200).json({
      success: true,
      data: expensesByCategory,
    });
  } catch (error) {
    console.error("Get expenses by category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses by category",
    });
  }
};
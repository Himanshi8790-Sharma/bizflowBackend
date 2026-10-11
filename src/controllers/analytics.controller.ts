import { analyticsService } from "../services/analytics.service.js";
import type { Request, Response } from "express";

export const getSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
  res.status(401).json({
    success: false,
    message: "Authentication required",
  });
  return;
}
    const organizationId = req.user.organizationId;

    const summary = await analyticsService.getSummary(organizationId);

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
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
  res.status(401).json({
    success: false,
    message: "Authentication required",
  });
  return;
}
    const organizationId = req.user.organizationId;

    const revenueTrend =
      await analyticsService.getRevenueTrend(organizationId);

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
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
  res.status(401).json({
    success: false,
    message: "Authentication required",
  });
  return;
}
    const organizationId = req.user.organizationId;

    const topProducts =
      await analyticsService.getTopProducts(organizationId);

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
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
  res.status(401).json({
    success: false,
    message: "Authentication required",
  });
  return;
}
    const organizationId = req.user.organizationId;

    const orderStatusDistribution =
      await analyticsService.getOrderStatusDistribution(organizationId);

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
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
  res.status(401).json({
    success: false,
    message: "Authentication required",
  });
  return;
}
    const organizationId = req.user.organizationId;

    const expensesByCategory =
      await analyticsService.getExpensesByCategory(organizationId);

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
import { prisma } from "../lib/prisma.js";

export const analyticsService = {
  /**
   * Get dashboard summary for an organization.
   */
  async getSummary(organizationId: string) {
    const [totalOrders, pendingOrders, totalCustomers, revenueResult] =
      await Promise.all([
        prisma.order.count({
          where: {
            organizationId,
          },
        }),

        prisma.order.count({
          where: {
            organizationId,
            status: "PENDING",
          },
        }),

        prisma.customer.count({
          where: {
            organizationId,
            isActive: true,
            deletedAt: null,
          },
        }),

        prisma.order.aggregate({
          where: {
            organizationId,
            status: {
              not: "CANCELLED",
            },
          },
          _sum: {
            totalAmount: true,
          },
        }),
      ]);

    return {
      totalRevenue: revenueResult._sum.totalAmount ?? 0,
      totalOrders,
      totalCustomers,
      pendingOrders,
    };
  },

  /**
   * Get daily revenue trend for an organization.
   *
   * Returns revenue for the last 30 days.
   */
  async getRevenueTrend(organizationId: string) {
    const startDate = new Date();

    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 29);

    const orders = await prisma.order.findMany({
      where: {
        organizationId,
        status: {
          not: "CANCELLED",
        },
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const revenueByDate = new Map<string, number>();

    for (const order of orders) {
      const date = order.createdAt.toISOString().slice(0, 10);
      revenueByDate.set(
        date,
        (revenueByDate.get(date) ?? 0) + order.totalAmount,
      );
    }

    const revenueTrend = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dateString = date.toISOString().slice(0, 10);
      revenueTrend.push({
        date: dateString,
        revenue: revenueByDate.get(dateString) ?? 0,
      });
    }

    return revenueTrend;
  },

  /**
   * Get top-selling products for an organization.
   */
  async getTopProducts(organizationId: string) {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          organizationId,
          status: {
            not: "CANCELLED",
          },
        },
        product: {
          isActive: true,
          deletedAt: null,
        },
      },
      select: {
        productId: true,
        quantity: true,
        total: true,
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    const productMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        quantitySold: number;
        revenue: number;
      }
    >();

    for (const item of orderItems) {
      const existingProduct = productMap.get(item.productId);

      if (existingProduct) {
        existingProduct.quantitySold += item.quantity;
        existingProduct.revenue += item.total;
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: item.product.name,
          quantitySold: item.quantity,
          revenue: item.total,
        });
      }
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);
  },

  /**
   * Get order count grouped by order status.
   */
  async getOrderStatusDistribution(organizationId: string) {
    const orders = await prisma.order.groupBy({
      by: ["status"],
      where: {
        organizationId,
      },
      _count: {
        id: true,
      },
    });

    return orders.map((order) => ({
      status: order.status,
      count: order._count.id,
    }));
  },

  /**
   * Get total expenses grouped by category.
   */
  async getExpensesByCategory(organizationId: string) {
    const expenses = await prisma.expense.groupBy({
      by: ["category"],
      where: {
        organizationId,
        deletedAt: null,
        category: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return expenses.map((expense) => ({
      category: expense.category,
      amount: expense._sum.amount ?? 0,
    }));
  },
};

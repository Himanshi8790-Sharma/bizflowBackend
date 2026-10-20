import { prisma } from "../lib/prisma.js";

export const expenseService = {
  async createExpense(data: any, organizationId: string, userId: string) {
    return prisma.expense.create({
      data: {
        ...data,
        organizationId,
        createdById: userId,
      },
    });
  },

  async getExpenses(organizationId: string) {
    return prisma.expense.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      orderBy: {
        expenseDate: "desc",
      },
    });
  },

  async getExpenseById(id: string, organizationId: string) {
    return prisma.expense.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });
  },

  async updateExpense(id: string, organizationId: string, data: any) {
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!expense) {
      return null;
    }

    return prisma.expense.update({
      where: { id },
      data,
    });
  },

  async deleteExpense(id: string, organizationId: string) {
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!expense) {
      return null;
    }

    return prisma.expense.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  },
};
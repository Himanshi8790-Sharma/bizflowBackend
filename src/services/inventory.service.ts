import { prisma } from "../lib/prisma.js";
import type { InventoryMovementType } from "@prisma/client";

export const inventoryService = {
  // Get inventory summary
  async getInventorySummary(organizationId: string) {
    const products = await prisma.product.findMany({
      where: {
        organizationId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        stockQuantity: true,
        lowStockLimit: true,
      },
    });

    return {
      totalProducts: products.length,

      totalStockUnits: products.reduce(
        (total, product) => total + product.stockQuantity,
        0,
      ),

      lowStockProducts: products.filter(
        (product) => product.stockQuantity <= product.lowStockLimit,
      ).length,

      outOfStockProducts: products.filter(
        (product) => product.stockQuantity === 0,
      ).length,
    };
  },

  // Get all inventory products
  async getInventory(organizationId: string) {
    return prisma.product.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        lowStockLimit: true,
        isActive: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  // Get low-stock products
  async getLowStockProducts(organizationId: string) {
    const products = await prisma.product.findMany({
      where: {
        organizationId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        lowStockLimit: true,
      },
      orderBy: {
        stockQuantity: "asc",
      },
    });

    return products.filter(
      (product) => product.stockQuantity <= product.lowStockLimit,
    );
  },

  // Get inventory movement history
  async getMovementHistory(
    organizationId: string,
    productId?: string,
  ) {
    return prisma.inventoryMovement.findMany({
      where: {
        organizationId,
        ...(productId ? { productId } : {}),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
  },

  // Adjust stock and create movement history
  async adjustStock(
    organizationId: string,
    productId: string,
    userId: string,
    quantity: number,
    type: InventoryMovementType,
    reason?: string,
  ) {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new Error("Quantity must be a positive integer");
    }

    const increaseTypes: InventoryMovementType[] = [
      "INCREASE",
      "RESTOCK",
      "RETURN",
    ];

    const decreaseTypes: InventoryMovementType[] = ["DECREASE"];

    if (
      !increaseTypes.includes(type) &&
      !decreaseTypes.includes(type) &&
      type !== "ADJUSTMENT"
    ) {
      throw new Error("Invalid inventory movement type");
    }

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id: productId,
          organizationId,
          isActive: true,
          deletedAt: null,
        },
        select: {
          id: true,
          stockQuantity: true,
        },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const previousStock = product.stockQuantity;

      // ADJUSTMENT is treated as an increase in this API.
      const newStock = decreaseTypes.includes(type)
        ? previousStock - quantity
        : previousStock + quantity;

      if (newStock < 0) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      // Avoid overwriting another concurrent stock update.
      const updateResult = await tx.product.updateMany({
        where: {
          id: productId,
          organizationId,
          stockQuantity: previousStock,
          isActive: true,
          deletedAt: null,
        },
        data: {
          stockQuantity: newStock,
        },
      });

      if (updateResult.count !== 1) {
        throw new Error("STOCK_UPDATE_CONFLICT");
      }

      const movement = await tx.inventoryMovement.create({
        data: {
          organizationId,
          productId,
          createdById: userId,
          type,
          quantity,
          previousStock,
          newStock,
          ...(reason ? { reason } : {}),
        },
      });

      return {
        productId,
        previousStock,
        newStock,
        movement,
      };
    });
  },
};
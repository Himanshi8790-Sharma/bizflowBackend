import { prisma } from "../lib/prisma.js";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "../validators/product.validator.js";

export const productService = {
  /**
   * Create a product for an organization.
   */
  async createProduct(
    organizationId: string,
    data: CreateProductInput
  ) {
    return prisma.product.create({
      data: {
        organizationId,
        name: data.name,
        sku: data.sku ?? null,
        description: data.description ?? null,
        price: data.price,
        costPrice: data.costPrice ?? null,
        stockQuantity: data.stockQuantity,
        lowStockLimit: data.lowStockLimit,
      },
    });
  },

  /**
   * Get all products for an organization with pagination.
   */
  async getProducts(
    organizationId: string,
    page: number,
    limit: number
  ) {
    const skip = (page - 1) * limit;

    const where = {
      organizationId,
      deletedAt: null,
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.product.count({
        where,
      }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get a single product belonging to an organization.
   */
  async getProductById(
    organizationId: string,
    productId: string
  ) {
    return prisma.product.findFirst({
      where: {
        id: productId,
        organizationId,
        deletedAt: null,
      },
    });
  },

  /**
   * Update a product belonging to an organization.
   */
  async updateProduct(
    organizationId: string,
    productId: string,
    data: UpdateProductInput
  ) {
    const updateData = {
      ...(data.name !== undefined && {
        name: data.name,
      }),
      ...(data.sku !== undefined && {
        sku: data.sku,
      }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.price !== undefined && {
        price: data.price,
      }),
      ...(data.costPrice !== undefined && {
        costPrice: data.costPrice,
      }),
      ...(data.stockQuantity !== undefined && {
        stockQuantity: data.stockQuantity,
      }),
      ...(data.lowStockLimit !== undefined && {
        lowStockLimit: data.lowStockLimit,
      }),
    };

    const result = await prisma.product.updateMany({
      where: {
        id: productId,
        organizationId,
        deletedAt: null,
      },
      data: updateData,
    });

    if (result.count === 0) {
      return null;
    }

    return this.getProductById(organizationId, productId);
  },

  /**
   * Soft-delete a product.
   */
  async deleteProduct(
    organizationId: string,
    productId: string
  ) {
    const result = await prisma.product.updateMany({
      where: {
        id: productId,
        organizationId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return result.count > 0;
  },
};
import { prisma } from "../lib/prisma.js";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../validators/customer.validator.js";

export const customerService = {
  /**
   * Create a customer for an organization.
   */
  async createCustomer(
    organizationId: string,
    data: CreateCustomerInput
  ) {
    return prisma.customer.create({
      data: {
        name: data.name,
        organizationId,
        ...(data.email !== undefined && {
          email: data.email,
        }),
        ...(data.phone !== undefined && {
          phone: data.phone,
        }),
        ...(data.address !== undefined && {
          address: data.address,
        }),
      },
    });
  },

  /**
   * Get all customers for an organization with pagination.
   */
  async getCustomers(
    organizationId: string,
    page: number,
    limit: number
  ) {
    const skip = (page - 1) * limit;

    const where = {
      organizationId,
      deletedAt: null,
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.customer.count({
        where,
      }),
    ]);

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get a single customer belonging to an organization.
   */
  async getCustomerById(
    organizationId: string,
    customerId: string
  ) {
    return prisma.customer.findFirst({
      where: {
        id: customerId,
        organizationId,
        deletedAt: null,
      },
    });
  },

  /**
   * Update a customer belonging to an organization.
   */
  async updateCustomer(
    organizationId: string,
    customerId: string,
    data: UpdateCustomerInput
  ) {
    const updateData = {
      ...(data.name !== undefined && {
        name: data.name,
      }),
      ...(data.email !== undefined && {
        email: data.email,
      }),
      ...(data.phone !== undefined && {
        phone: data.phone,
      }),
      ...(data.address !== undefined && {
        address: data.address,
      }),
    };

    const result = await prisma.customer.updateMany({
      where: {
        id: customerId,
        organizationId,
        deletedAt: null,
      },
      data: updateData,
    });

    if (result.count === 0) {
      return null;
    }

    return this.getCustomerById(organizationId, customerId);
  },

  /**
   * Soft-delete a customer.
   */
  async deleteCustomer(
    organizationId: string,
    customerId: string
  ) {
    const result = await prisma.customer.updateMany({
      where: {
        id: customerId,
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
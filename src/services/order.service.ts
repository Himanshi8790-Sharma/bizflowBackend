import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { CreateOrderInput, UpdateOrderStatusInput } from "../validators/order.validator.js";



class OrderService {
  async createOrder(
    input: CreateOrderInput,
    organizationId: string,
    userId: string,
  ) {
    const { customerId, items, taxAmount, discountAmount, notes } = input;

    // Aggregate duplicate product IDs.
    const quantityByProduct = new Map<string, number>();

    for (const item of items) {
      const current = quantityByProduct.get(item.productId) ?? 0;

      const next = current + item.quantity;

      if (!Number.isSafeInteger(next)) {
        throw new Error("Product quantity is too large");
      }

      quantityByProduct.set(item.productId, next);
    }

    const normalizedItems = Array.from(
      quantityByProduct,
      ([productId, quantity]) => ({
        productId,
        quantity,
      }),
    );

    return prisma.$transaction(
      async (tx) => {
        // 1. Validate customer.
        const customer = await tx.customer.findFirst({
          where: {
            id: customerId,
            organizationId,
            isActive: true,
            deletedAt: null,
          },
          select: {
            id: true,
          },
        });

        if (!customer) {
          throw new Error("Customer not found or inactive");
        }

        // 2. Fetch products belonging to this organization.
        const productIds = normalizedItems.map((item) => item.productId);

        const products = await tx.product.findMany({
          where: {
            id: {
              in: productIds,
            },
            organizationId,
            isActive: true,
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            price: true,
          },
        });

        if (products.length !== productIds.length) {
          throw new Error("One or more products are unavailable");
        }

        const productById = new Map(
          products.map((product) => [product.id, product]),
        );

        // 3. Calculate subtotal using database prices.
        let subtotal = 0;

        const orderItems = normalizedItems.map((item) => {
          const product = productById.get(item.productId);

          if (!product) {
            throw new Error("Product not found");
          }

          const total = product.price * item.quantity;

          if (!Number.isSafeInteger(total) || total < 0) {
            throw new Error("Invalid product total");
          }

          subtotal += total;

          if (!Number.isSafeInteger(subtotal)) {
            throw new Error("Order subtotal is too large");
          }

          return {
            productId: product.id,
            quantity: item.quantity,
            unitPrice: product.price,
            total,
          };
        });

        // 4. Calculate final amount.
        const totalAmount = subtotal + taxAmount - discountAmount;

        if (!Number.isSafeInteger(totalAmount) || totalAmount < 0) {
          throw new Error("Invalid order total");
        }

        // 5. Deduct stock using conditional updates.
        for (const item of normalizedItems) {
          const result = await tx.product.updateMany({
            where: {
              id: item.productId,
              organizationId,
              isActive: true,
              deletedAt: null,
              stockQuantity: {
                gte: item.quantity,
              },
            },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });

          if (result.count !== 1) {
            throw new Error("Insufficient stock for one or more products");
          }
        }

        // 6. Generate an order number.
        const orderNumber = `ORD-${Date.now()}-${Math.floor(
          Math.random() * 10000,
        )}`;

        // 7. Create order and order items atomically.
const order = await tx.order.create({
  data: {
    organizationId,
    customerId,
    createdById: userId,
    orderNumber,
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    notes: notes ?? null,
    items: {
      create: orderItems,
    },
  },
  include: {
    customer: true,
    items: {
      include: {
        product: true,
      },
    },
  },
});

        return order;
      },
      {
  maxWait: 10000,
  timeout: 20000,
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
},
    );
  }

  // Get all orders for an organization.
  async getOrders(organizationId: string) {
    return prisma.order.findMany({
      where: {
        organizationId,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get a single order.
  async getOrderById(orderId: string, organizationId: string) {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        organizationId,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // Update order status.
  async updateOrderStatus(
    orderId: string,
    organizationId: string,
    input: UpdateOrderStatusInput,
  ) {
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        organizationId,
      },
    });

    if (!existingOrder) {
      throw new Error("Order not found");
    }

    if (
      existingOrder.status === OrderStatus.CANCELLED ||
      existingOrder.status === OrderStatus.COMPLETED
    ) {
      throw new Error("Cannot update a completed or cancelled order");
    }

    return prisma.order.update({
      where: {
        id: existingOrder.id,
      },
      data: {
        status: input.status,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // Cancel an order and restore inventory.
  async cancelOrder(orderId: string, organizationId: string) {
    return prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findFirst({
          where: {
            id: orderId,
            organizationId,
          },
          include: {
            items: true,
          },
        });

        if (!order) {
          throw new Error("Order not found");
        }

        if (order.status === OrderStatus.CANCELLED) {
          throw new Error("Order is already cancelled");
        }

        if (order.status === OrderStatus.COMPLETED) {
          throw new Error("Completed orders cannot be cancelled");
        }

        // Restore stock for every order item.
        for (const item of order.items) {
          await tx.product.updateMany({
            where: {
              id: item.productId,
              organizationId,
            },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          });
        }

        // Mark the order as cancelled.
        return tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: OrderStatus.CANCELLED,
          },
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }
}

export default new OrderService();

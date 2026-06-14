const { db, ObjectId } = require("./db");

/**
 * Transform MongoDB document to GraphQL type
 * Maps MongoDB document fields directly (no ObjectId conversion needed)
 */
function transformCustomer(doc) {
  if (!doc) return null;
  return {
    ...doc,
    createdAt: doc.createdAt || new Date(),
  };
}

function transformOrder(doc) {
  if (!doc) return null;
  return {
    ...doc,
    createdAt: doc.createdAt || new Date(),
  };
}

/**
 * GraphQL resolvers for queries, mutations, and field relationships
 */
const resolvers = {
  Query: {
    /**
     * Query: Get a single customer by ID
     */
    async customer(_, { id }) {
      try {
        const customer = await db.findById("customers", id);
        if (!customer) {
          throw new Error(`Customer not found: ${id}`);
        }

        return transformCustomer(customer);
      } catch (error) {
        console.error("Error fetching customer:", error.message);
        throw error;
      }
    },

    /**
     * Query: Get all customers
     */
    async customers() {
      try {
        const result = await db.findMany("customers", {});
        console.log(`✓ Fetched ${result.items.length} customers`);
        return result.items.map(transformCustomer);
      } catch (error) {
        console.error("Error fetching customers:", error.message);
        throw error;
      }
    },

    /**
     * Query: Get a single order by ID
     */
    async order(_, { id }) {
      try {
        const order = await db.findById("orders", id);
        if (!order) {
          throw new Error(`Order not found: ${id}`);
        }

        return transformOrder(order);
      } catch (error) {
        console.error("Error fetching order:", error.message);
        throw error;
      }
    },

    /**
     * Query: Get all orders with pagination
     */
    async orders(_, { offset = 0, limit = 10 }) {
      try {
        const result = await db.findMany("orders", {}, { offset, limit });

        return {
          items: result.items.map(transformOrder),
          total: result.total,
          offset: result.offset,
          limit: result.limit,
        };
      } catch (error) {
        console.error("Error fetching orders:", error.message);
        throw error;
      }
    },
  },

  Mutation: {
    /**
     * Mutation: Create a new customer
     */
    async createCustomer(_, { input }) {
      try {
        // Validation
        if (!input._id || !input.firstName || !input.lastName || !input.email) {
          throw new Error("_id, firstName, lastName, and email are required");
        }

        // Insert new customer
        const customer = await db.insert("customers", {
          _id: input._id,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          status: input.status,
          address: input.address,
          createdAt: input.createdAt || new Date(),
        });

        return transformCustomer(customer);
      } catch (error) {
        console.error("Error creating customer:", error.message);
        throw error;
      }
    },

    /**
     * Mutation: Update an existing customer
     */
    async updateCustomer(_, { id, input }) {
      try {
        const customer = await db.updateById("customers", id, {
          ...input,
        });

        if (!customer) {
          throw new Error(`Customer not found: ${id}`);
        }

        return transformCustomer(customer);
      } catch (error) {
        console.error("Error updating customer:", error.message);
        throw error;
      }
    },

    /**
     * Mutation: Delete a customer
     */
    async deleteCustomer(_, { id }) {
      try {
        const deleted = await db.deleteById("customers", id);

        if (!deleted) {
          throw new Error(`Customer not found: ${id}`);
        }

        return true;
      } catch (error) {
        console.error("Error deleting customer:", error.message);
        throw error;
      }
    },

    /**
     * Mutation: Create a new order
     */
    async createOrder(_, { input }) {
      try {
        // Validation
        if (!input.customerId || input.total === undefined) {
          throw new Error("customerId and total are required");
        }

        // Verify customer exists
        const customer = await db.findById("customers", input.customerId);
        if (!customer) {
          throw new Error(`Customer not found: ${input.customerId}`);
        }

        // Insert new order
        const order = await db.insert("orders", {
          customerId: input.customerId,
          total: input.total,
          status: input.status || "pending",
          createdAt: new Date(),
        });

        return transformOrder(order);
      } catch (error) {
        console.error("Error creating order:", error.message);
        throw error;
      }
    },

    /**
     * Mutation: Update an existing order
     */
    async updateOrder(_, { id, input }) {
      try {
        const order = await db.updateById("orders", id, {
          ...input,
        });

        if (!order) {
          throw new Error(`Order not found: ${id}`);
        }

        return transformOrder(order);
      } catch (error) {
        console.error("Error updating order:", error.message);
        throw error;
      }
    },

    /**
     * Mutation: Delete an order
     */
    async deleteOrder(_, { id }) {
      try {
        if (!ObjectId.isValid(id)) {
          throw new Error(`Invalid order ID format: ${id}`);
        }

        const deleted = await db.deleteById("orders", id);

        if (!deleted) {
          throw new Error(`Order not found: ${id}`);
        }

        return true;
      } catch (error) {
        console.error("Error deleting order:", error.message);
        throw error;
      }
    },
  },

  /**
   * Field resolvers for Customer type
   */
  Customer: {
    /**
     * Resolve the orders relationship for a customer
     */
    async orders(parent) {
      try {
        const result = await db.findMany(
          "orders",
          { customerId: parent._id },
          {},
        );

        return result.items.map(transformOrder);
      } catch (error) {
        console.error("Error fetching customer orders:", error.message);
        return [];
      }
    },
  },

  /**
   * Field resolvers for Order type
   */
  Order: {
    /**
     * Resolve the customer relationship for an order
     */
    async customer(parent) {
      try {
        if (!parent.customerId) return null;

        const customer = await db.findById("customers", parent.customerId);
        return customer ? transformCustomer(customer) : null;
      } catch (error) {
        console.error("Error fetching order customer:", error.message);
        return null;
      }
    },
  },
};

module.exports = resolvers;

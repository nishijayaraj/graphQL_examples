---
name: graphql-express-mongo-server
description: Build a production-ready Node.js Express GraphQL application from an existing MongoDB database.
---

# GraphQL Express Server with MongoDB

**Purpose:** Build a production-ready GraphQL API server using Express.js and MongoDB, with auto-generated schema and resolvers from database introspection.

**Scope:** Workspace-scoped skill for creating GraphQL servers with MongoDB data sources.

**Complexity:** Multi-step workflow with quality gates and relationship detection.

---

## Workflow Overview

### Phase 1: Connection & Discovery

1. **Request MongoDB connection** - Prompt for connection string or use local default
2. **Connect to MongoDB** - Establish singleton connection with pooling
3. **Discover collections** - List all collections in the database
4. **Sample documents** - Retrieve 5-10 sample documents per collection for schema inference

### Phase 2: Schema Inference & Relationship Detection

1. **Analyze document structure** - Examine MongoDB documents to identify field types
2. **Map MongoDB types to GraphQL** - Convert BSON types to GraphQL scalars/types
3. **Detect relationships** - Identify foreign keys:
   - ObjectId references to other collections
   - Foreign-key style field names (customerId, orderId, studentId, collegeId, productId)
4. **Generate GraphQL types** - Create one type per collection with all fields
5. **Define relationships** - Add field resolvers for related entities and reverse relationships

### Phase 3: GraphQL Schema Generation

1. **Define Query type** - Create root Query with:
   - Single entity queries: `customer(id: ID!): Customer`
   - List queries with pagination: `customers(offset: Int, limit: Int): CustomerPage`
2. **Define Mutation type** - Create CRUD operations:
   - `create{Entity}(input: Create{Entity}Input!): {Entity}!`
   - `update{Entity}(id: ID!, input: Update{Entity}Input!): {Entity}!`
   - `delete{Entity}(id: ID!): Boolean!`
3. **Define pagination types** - Create wrapper types:
   - `{Entity}Page` with `items: [{Entity}!]!`, `total: Int!`, `offset: Int!`, `limit: Int!`
4. **Export schema** - Write `schema.graphql` file with all type definitions

### Phase 4: Database Layer (db.js)

1. **Initialize MongoDB driver** - Set up singleton connection with CommonJS
2. **Create collection accessors** - Provide methods to get collections by name
3. **Implement CRUD methods** - Generic insert/update/delete/find operations
4. **Add pagination support** - Implement offset/limit in list queries
5. **Handle ObjectId conversion** - Automatically convert string IDs to MongoDB ObjectId
6. **Relationship resolution** - Add methods to fetch related documents by foreign keys
7. **Error handling** - Return null for missing records, throw errors for operations

### Phase 5: Resolver Implementation

1. **Query resolvers** - Implement handlers to fetch single/multiple documents
2. **Mutation resolvers** - Implement create/update/delete handlers with validation
3. **Field resolvers** - Resolve relationship fields (e.g., `Order.customer()`)
4. **Input validation** - Check required fields before database operations
5. **Error wrapping** - Catch database errors and return meaningful GraphQL errors

### Phase 6: Server Configuration

1. **Express setup** - Initialize Express app with middleware
2. **Apollo Server** - Configure GraphQL endpoint at `/graphql`
3. **CORS & body parser** - Enable cross-origin requests and JSON parsing
4. **Port configuration** - Default to port 9000 (configurable via env vars)
5. **Module format** - Use CommonJS (`require`/`module.exports`)
6. **GraphQL Playground** - Enable introspection and playground at `/graphiql`

### Phase 7: Quality & Testing

1. **Code review checklist** - Verify all generated code meets standards
2. **Functional testing** - Run sample queries and mutations
3. **Relationship verification** - Test relationship resolvers
4. **Error scenario testing** - Verify error handling for edge cases

---

## Connection & Database Configuration

### Environment Variables

```javascript
// Use environment variables with sensible defaults
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "myapp";
const port = process.env.PORT || 9000;
```

### Connection Pooling

Implement singleton pattern:

```javascript
let connection = null;

async function getConnection() {
  if (!connection) {
    const client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    await client.connect();
    connection = { client, db: client.db(dbName) };
  }
  return connection;
}
```

---

## Error Handling Patterns

**Use try-catch in resolvers** with consistent error responses:

```javascript
// Pattern: Catch database errors and return meaningful messages
const createOrder = async (_, { input }, { db }) => {
  try {
    // Validation
    if (!input.customerId || !input.items?.length) {
      throw new Error("customerId and items are required");
    }

    // Convert string IDs to ObjectId
    const customerId = new ObjectId(input.customerId);

    // Verify foreign key exists
    const customer = await db.findById("customers", customerId);
    if (!customer) {
      throw new Error(`Customer not found: ${input.customerId}`);
    }

    // Operation
    const order = await db.insert("orders", {
      ...input,
      customerId,
      createdAt: new Date(),
    });

    return order;
  } catch (error) {
    console.error("Error creating order:", error.message);
    throw new Error(`Failed to create order: ${error.message}`);
  }
};
```

**Error scenarios to handle:**

- Missing required fields (validation errors)
- Invalid ObjectId format (ID parsing errors)
- Record not found (404-style errors)
- Invalid foreign keys (referential integrity)
- Duplicate key violations (if unique indexes exist)
- Connection failures (retry with exponential backoff)

**MCP Integration Fallback:**

```javascript
// If MCP MongoDB server is available, use it for schema discovery
// Otherwise, connect directly to MongoDB
const hasAlternativeMCP = await checkMCPAvailability();

if (hasAlternativeMCP) {
  // Use MCP methods: listDatabases, listCollections, sampleDocuments
} else {
  // Use direct MongoDB driver
}
```

---

## Schema Inference Strategy

### Type Mapping

| MongoDB  | GraphQL     | Notes                           |
| -------- | ----------- | ------------------------------- |
| ObjectId | ID          | Convert to/from string          |
| String   | String      | Handle null/empty strings       |
| Number   | Float       | Includes both Int and Double    |
| Boolean  | Boolean     | Direct mapping                  |
| Date     | String      | ISO 8601 format                 |
| Array    | [Type]      | Infer element type from samples |
| Object   | Nested Type | Create sub-types for objects    |
| Null     | Nullable    | Omit `!` for nullable fields    |

### Relationship Detection Priority

1. **ObjectId references** - Highest priority (e.g., `customerId: ObjectId(...)`)
2. **Foreign-key patterns** - Check for fields ending in `Id` matching other collections
   - `customerId` → Collection `customers`
   - `orderId` → Collection `orders`
   - `studentId` → Collection `students`
3. **Array references** - Handle arrays of ObjectIds (e.g., `tags: [ObjectId(...)]`)
4. **Ambiguous relationships** - If multiple matches, use closest collection name

### Handling Edge Cases

- **Collections with no documents** - Generate types with empty fields, require user input
- **Large collections** - Sample max 10 documents to balance speed and accuracy
- **Deeply nested objects** - Flatten or create separate types based on depth
- **Circular relationships** - Include both directions but avoid infinite recursion in queries

---

## Package.json Template

Generate this minimal package.json:

```json
{
  "name": "graphql-mongodb-server",
  "version": "1.0.0",
  "private": true,
  "description": "GraphQL API server with MongoDB backend",
  "main": "server.js",
  "scripts": {
    "start": "nodemon server.js",
    "dev": "nodemon --inspect server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["graphql", "apollo", "express", "mongodb"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "apollo-server-express": "^3.13.0",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "express": "^4.21.0",
    "graphql": "^16.11.0",
    "graphql-tools": "^9.0.0",
    "mongodb": "^6.18.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

---

# Skill Instructions

## Step 1: Request MongoDB Connection String

Prompt the user for their MongoDB connection:

```
Please provide the MongoDB connection string.

Examples:
  • mongodb://localhost:27017                               (Local)
  • mongodb://user:password@server:27017                    (Remote)
  • mongodb+srv://user:password@cluster.mongodb.net         (Atlas)

Press Enter to use default: mongodb://localhost:27017
```

Code:

```javascript
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "test";
```

---

## Step 2: Connect to MongoDB (db.js)

Create a reusable MongoDB connection layer in `db.js`:

```javascript
const { MongoClient, ObjectId } = require("mongodb");

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "test";

let connection = null;

async function getConnection() {
  if (!connection) {
    const client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    await client.connect();
    connection = { client, db: client.db(dbName) };
    console.log(`Connected to MongoDB: ${dbName}`);
  }
  return connection;
}

// Generic CRUD methods
const db = {
  async insert(collectionName, document) {
    const { db: database } = await getConnection();
    const result = await database
      .collection(collectionName)
      .insertOne(document);
    return { _id: result.insertedId, ...document };
  },

  async findById(collectionName, id) {
    const { db: database } = await getConnection();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    return database.collection(collectionName).findOne({ _id: objectId });
  },

  async findMany(collectionName, filter = {}, options = {}) {
    const { db: database } = await getConnection();
    const offset = options.offset || 0;
    const limit = options.limit || 10;

    const collection = database.collection(collectionName);
    const items = await collection
      .find(filter)
      .skip(offset)
      .limit(limit)
      .toArray();
    const total = await collection.countDocuments(filter);

    return { items, total, offset, limit };
  },

  async updateById(collectionName, id, updates) {
    const { db: database } = await getConnection();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const result = await database
      .collection(collectionName)
      .findOneAndUpdate(
        { _id: objectId },
        { $set: updates },
        { returnDocument: "after" },
      );
    return result.value;
  },

  async deleteById(collectionName, id) {
    const { db: database } = await getConnection();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const result = await database
      .collection(collectionName)
      .deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  },
};

module.exports = { db, getConnection, ObjectId };
```

**Requirements:**

- Singleton connection pattern
- Connection pooling (min/max pool sizes)
- CommonJS modules (`require`/`module.exports`)
- Generic CRUD methods for all collections
- Automatic ObjectId conversion
- Pagination support (offset/limit)

---

## Step 3: Check for MCP MongoDB Server

If available, use MCP instead of direct driver:

```javascript
// Check if MCP server is available
const hasMCP = await checkMCPAvailability();

if (hasMCP) {
  // Use MCP methods:
  // - mcp_graphql-mongo_list_databases()
  // - mcp_graphql-mongo_list_collections()
  // - mcp_graphql-mongo_sample_documents()
  // - mcp_graphql-mongo_infer_schema()
} else {
  // Fall back to direct MongoDB driver connection
  const { db } = await getConnection();
}
```

MCP operations prioritize speed over direct driver calls.

---

## Step 4: Discover Collections & Sample Documents

List all collections and retrieve 5-10 sample documents:

```javascript
async function discoverSchema() {
  const { db: database } = await getConnection();
  const collections = await database.listCollections().toArray();

  const schema = {};

  for (const { name } of collections) {
    const collection = database.collection(name);
    const samples = await collection.find({}).limit(10).toArray();

    schema[name] = {
      count: await collection.countDocuments(),
      samples,
      fields: inferFields(samples),
    };
  }

  return schema;
}

function inferFields(samples) {
  if (!samples.length) return {};

  const fields = {};
  for (const sample of samples) {
    for (const [key, value] of Object.entries(sample)) {
      if (!fields[key]) {
        fields[key] = inferType(value);
      }
    }
  }
  return fields;
}

function inferType(value) {
  if (value === null || value === undefined) return "nullable";
  if (value.constructor.name === "ObjectId") return "ID";
  if (typeof value === "string") return "String";
  if (typeof value === "number") return value % 1 === 0 ? "Int" : "Float";
  if (typeof value === "boolean") return "Boolean";
  if (value instanceof Date) return "DateTime";
  if (Array.isArray(value)) return "Array";
  if (typeof value === "object") return "Object";
  return "Unknown";
}
```

---

## Step 5: Generate GraphQL Schema (schema.graphql)

Create type definitions based on discovered collections:

```graphql
scalar DateTime

# Generated from MongoDB collections

type Query {
  customer(id: ID!): Customer
  customers(offset: Int, limit: Int): CustomerPage!
  order(id: ID!): Order
  orders(offset: Int, limit: Int): OrderPage!
}

type Mutation {
  createCustomer(input: CreateCustomerInput!): Customer!
  updateCustomer(id: ID!, input: UpdateCustomerInput!): Customer!
  deleteCustomer(id: ID!): Boolean!

  createOrder(input: CreateOrderInput!): Order!
  updateOrder(id: ID!, input: UpdateOrderInput!): Order!
  deleteOrder(id: ID!): Boolean!
}

type Customer {
  id: ID!
  firstName: String!
  lastName: String!
  email: String!
  orders: [Order!]!
}

type CustomerPage {
  items: [Customer!]!
  total: Int!
  offset: Int!
  limit: Int!
}

type Order {
  id: ID!
  customerId: ID!
  customer: Customer!
  total: Float!
  createdAt: DateTime!
}

type OrderPage {
  items: [Order!]!
  total: Int!
  offset: Int!
  limit: Int!
}

input CreateCustomerInput {
  firstName: String!
  lastName: String!
  email: String!
}

input UpdateCustomerInput {
  firstName: String
  lastName: String
  email: String
}

input CreateOrderInput {
  customerId: ID!
  total: Float!
}

input UpdateOrderInput {
  total: Float
}
```

**Requirements:**

- Non-null fields marked with `!` where appropriate
- Pagination types with items, total, offset, limit
- Input types for mutations
- Scalar types for custom types (DateTime, etc.)
- One type per collection

---

## Step 6: Generate Resolvers (resolvers.js)

Implement query, mutation, and field resolvers:

```javascript
const { db, ObjectId } = require("./db");

const resolvers = {
  Query: {
    async customer(_, { id }) {
      try {
        const customer = await db.findById("customers", id);
        if (!customer) throw new Error(`Customer not found: ${id}`);
        return transformCustomer(customer);
      } catch (error) {
        console.error("Error fetching customer:", error);
        throw error;
      }
    },

    async customers(_, { offset = 0, limit = 10 }) {
      try {
        const result = await db.findMany("customers", {}, { offset, limit });
        return {
          items: result.items.map(transformCustomer),
          total: result.total,
          offset,
          limit,
        };
      } catch (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
    },

    async order(_, { id }) {
      try {
        const order = await db.findById("orders", id);
        if (!order) throw new Error(`Order not found: ${id}`);
        return transformOrder(order);
      } catch (error) {
        console.error("Error fetching order:", error);
        throw error;
      }
    },

    async orders(_, { offset = 0, limit = 10 }) {
      try {
        const result = await db.findMany("orders", {}, { offset, limit });
        return {
          items: result.items.map(transformOrder),
          total: result.total,
          offset,
          limit,
        };
      } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
    },
  },

  Mutation: {
    async createCustomer(_, { input }) {
      try {
        if (!input.email || !input.firstName || !input.lastName) {
          throw new Error("firstName, lastName, and email are required");
        }
        const customer = await db.insert("customers", input);
        return transformCustomer(customer);
      } catch (error) {
        console.error("Error creating customer:", error);
        throw error;
      }
    },

    async updateCustomer(_, { id, input }) {
      try {
        const customer = await db.updateById("customers", id, input);
        if (!customer) throw new Error(`Customer not found: ${id}`);
        return transformCustomer(customer);
      } catch (error) {
        console.error("Error updating customer:", error);
        throw error;
      }
    },

    async deleteCustomer(_, { id }) {
      try {
        return await db.deleteById("customers", id);
      } catch (error) {
        console.error("Error deleting customer:", error);
        throw error;
      }
    },

    async createOrder(_, { input }) {
      try {
        if (!input.customerId || !input.total) {
          throw new Error("customerId and total are required");
        }
        const customer = await db.findById("customers", input.customerId);
        if (!customer) {
          throw new Error(`Customer not found: ${input.customerId}`);
        }
        const order = await db.insert("orders", {
          ...input,
          customerId: new ObjectId(input.customerId),
          createdAt: new Date(),
        });
        return transformOrder(order);
      } catch (error) {
        console.error("Error creating order:", error);
        throw error;
      }
    },

    async updateOrder(_, { id, input }) {
      try {
        const order = await db.updateById("orders", id, input);
        if (!order) throw new Error(`Order not found: ${id}`);
        return transformOrder(order);
      } catch (error) {
        console.error("Error updating order:", error);
        throw error;
      }
    },

    async deleteOrder(_, { id }) {
      try {
        return await db.deleteById("orders", id);
      } catch (error) {
        console.error("Error deleting order:", error);
        throw error;
      }
    },
  },

  // Field resolvers for relationships
  Customer: {
    async orders(parent) {
      const result = await db.findMany("orders", {
        customerId: new ObjectId(parent.id),
      });
      return result.items.map(transformOrder);
    },
  },

  Order: {
    async customer(parent) {
      if (!parent.customerId) return null;
      const customer = await db.findById("customers", parent.customerId);
      return customer ? transformCustomer(customer) : null;
    },
  },
};

// Transform functions to map MongoDB _id to GraphQL id
function transformCustomer(doc) {
  return { ...doc, id: doc._id };
}

function transformOrder(doc) {
  return { ...doc, id: doc._id };
}

module.exports = resolvers;
```

**Requirements:**

- All resolvers wrapped in try-catch blocks
- Input validation before database operations
- Consistent error messages
- ObjectId conversion handled automatically
- Field resolvers for relationships
- Transform functions to map `_id` to `id`

---

## Step 7: Create Express Server (server.js)

Set up Apollo Server with Express:

```javascript
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { ApolloServer } = require("apollo-server-express");
const { readFileSync } = require("fs");
const { join } = require("path");
const resolvers = require("./resolvers");

const PORT = process.env.PORT || 9000;

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());

  // Load schema
  const typeDefs = readFileSync(join(__dirname, "schema.graphql"), "utf-8");

  // Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
  });

  await server.start();
  server.applyMiddleware({ app });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(
      `🚀 GraphQL Server running at http://localhost:${PORT}/graphql`,
    );
    console.log(`📊 GraphQL Playground at http://localhost:${PORT}/graphiql`);
  });
}

startServer().catch(console.error);
```

**Requirements:**

- Express app with CORS and body-parser middleware
- Apollo Server with schema and resolvers
- GraphQL endpoint at `/graphql`
- GraphQL Playground at `/graphiql`
- Introspection enabled for playground
- Health check endpoint
- CommonJS modules

---

## Step 8: Quality Checks

### Code Review Checklist

- [ ] MongoDB connection succeeds without errors
- [ ] All collections discovered and listed
- [ ] Sample documents retrieved for all collections
- [ ] GraphQL types generated for each collection
- [ ] Relationships detected (ObjectId and foreign-key patterns)
- [ ] Query resolvers implemented for single and paginated fetches
- [ ] Mutation resolvers implemented for create/update/delete
- [ ] Field resolvers implemented for relationships
- [ ] Error handling in all resolvers with try-catch
- [ ] ObjectId conversion handled consistently
- [ ] CommonJS modules used throughout (`require`/`module.exports`)
- [ ] Production-quality comments for complex logic
- [ ] No hardcoded values (use environment variables)
- [ ] Pagination defaults and limits reasonable

### Functional Testing

- [ ] `npm install` succeeds without warnings
- [ ] `npm start` runs without errors
- [ ] GraphQL endpoint accessible at `http://localhost:9000/graphql`
- [ ] GraphQL Playground responsive at `http://localhost:9000/graphiql`
- [ ] Sample query executes: `{ customers { items { id firstName } } }`
- [ ] Sample mutation executes: `createCustomer(input: { ... })`
- [ ] Relationship resolvers work: `{ customers { orders { id } } }`
- [ ] Pagination working with different offset/limit values
- [ ] Error handling tested with invalid IDs and missing fields

---

## Decision Points & Branching

**Q: Single vs. multiple MongoDB databases?**

- Single database → Simpler setup, direct collection mapping
- Multiple databases → Add database selection parameter, more complex queries

**Q: Should all relationships be bidirectional?**

- Yes → Add reverse field resolvers (e.g., `Customer.orders`)
- No → Unidirectional relationships only (simpler schema)

**Q: Complex validation needed?**

- Yes → Add validation in mutation resolvers (format checks, business rules)
- No → Basic required-field checks only

**Q: Default pagination limits?**

- Recommended: `limit: 10, offset: 0` as defaults
- Edge cases: negative values → ignore, offset > total → empty results

**Q: Handle circular relationships?**

- Yes → Include both directions but prevent infinite recursion in queries
- No → One-directional references only

---

## Output Artifacts

Generated files in project root:

```
package.json          - Dependencies and scripts
server.js            - Express + Apollo Server configuration
db.js                - MongoDB connection and CRUD methods
schema.graphql       - GraphQL type definitions
resolvers.js         - Query/Mutation/Field resolvers
README.md            - Usage and deployment documentation
```

Optional directories:

```
/data                 - Backup/seed data
/types                - TypeScript types (if using TS)
/utils                - Helper functions
/migrations           - MongoDB schema migrations
```

---

## Quality Criteria

✅ **Code Quality**

- Consistent formatting and indentation
- Comments on all non-obvious logic
- Meaningful variable and function names
- Error messages are descriptive and actionable
- No sensitive data in code (use environment variables)

✅ **GraphQL Schema**

- Non-null fields marked with `!` where appropriate
- Return types clearly specified
- Arguments documented in resolver implementations
- Pagination fields present in list queries (items, total, offset, limit)
- Scalar types defined (e.g., DateTime)

✅ **Performance**

- Resolvers use efficient queries (no N+1 issues with pagination)
- Connection pooling configured (min/max pool sizes)
- Pagination prevents loading entire datasets
- Indexes assumed on common query fields

✅ **Error Handling**

- All resolvers wrapped in try-catch blocks
- Meaningful error messages for debugging
- Validation errors thrown before database operations
- Connection failures logged with context

✅ **Runnable**

- `npm install` → `npm start` workflow works end-to-end
- No external dependencies besides MongoDB
- GraphQL Playground accessible and functional
- Health check endpoint responding
- All environment variables documented

---

## Example Prompts to Invoke This Skill

- "Build a GraphQL API for my MongoDB database with Express"
- "Generate GraphQL schema and resolvers from my MongoDB collections"
- "Create a production-ready GraphQL server with CRUD mutations for MongoDB"
- "Auto-generate GraphQL types and resolvers from MongoDB documents"
- "Set up Apollo Server with Express on port 9000 using my MongoDB database"

---

## Related Customizations

After creating this skill, consider:

- **Cursor-based pagination** skill for Relay-style connections
- **GraphQL testing** skill for integration tests and query validation
- **Data loader optimization** skill to prevent N+1 query problems
- **Error recovery** skill for production logging and monitoring
- **Authentication** skill for JWT or session-based security
- **Schema documentation** skill for auto-generated GraphQL docs
- **MongoDB migration** skill for schema versioning and evolution

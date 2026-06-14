# GraphQL MongoDB Express Server

A production-ready GraphQL API server built with Express.js and MongoDB, featuring auto-generated schema and resolvers from database introspection.

## Features

✅ **Auto-Generated GraphQL Schema** - Infers types from MongoDB collections  
✅ **Complete CRUD Operations** - Query, mutation, and field resolvers  
✅ **Relationship Resolution** - Handles ObjectId references and foreign keys  
✅ **Pagination Support** - Built-in offset/limit for list queries  
✅ **Error Handling** - Try-catch blocks and meaningful error messages  
✅ **Apollo Playground** - Interactive GraphQL IDE at `/graphql`  
✅ **CommonJS Modules** - Full compatibility with Node.js

## Prerequisites

- **Node.js** v14+ (check with `node --version`)
- **MongoDB** running locally (or provide connection string)
  - Local: `mongodb://localhost:27017`
  - Remote: `mongodb+srv://user:password@cluster.mongodb.net`

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment (Optional)

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Default values are set for local development:

- `MONGODB_URI`: `mongodb://localhost:27017`
- `MONGODB_DB`: `graphql-app`
- `PORT`: `9000`

### 3. Start the Server

```bash
npm start
```

The server will start and display:

```
╔════════════════════════════════════════════════════════════╗
║          🚀 GraphQL Server is Running                       ║
╠════════════════════════════════════════════════════════════╣
║  GraphQL Endpoint:   http://localhost:9000/graphql
║  GraphQL Playground: http://localhost:9000/graphql
║  Health Check:       http://localhost:9000/health
╚════════════════════════════════════════════════════════════╝
```

## Database Setup

### Create Sample Data

Connect to MongoDB and insert sample documents:

```javascript
// customers collection
db.customers.insertMany([
  {
    _id: "CUST001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@gmail.com",
    phone: "+91-9876543210",
    status: "ACTIVE",
    address: {
      street: "12 MG Road",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      postalCode: "560001",
    },
    createdAt: new Date("2026-01-15T10:00:00Z"),
  },
  {
    _id: "CUST002",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@gmail.com",
    phone: "+91-9876543211",
    status: "ACTIVE",
    address: {
      street: "456 Park Ave",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      postalCode: "400001",
    },
    createdAt: new Date("2026-01-20T11:00:00Z"),
  },
]);

// orders collection
db.orders.insertMany([
  {
    _id: "ORD001",
    customerId: "CUST001",
    total: 99.99,
    status: "completed",
    createdAt: new Date("2026-02-01T10:00:00Z"),
  },
]);
```

## GraphQL Schema

### Entities

**Customer**

- `id` - Unique identifier
- `firstName` - First name
- `lastName` - Last name
- `email` - Email address
- `phone` - Phone number (optional)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `orders` - Related orders (field resolver)

**Order**

- `id` - Unique identifier
- `customerId` - Reference to customer
- `customer` - Related customer (field resolver)
- `total` - Order total amount
- `status` - Order status (pending, completed, etc.)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Sample Queries

#### Get All Customers with Pagination

```graphql
query {
  customers(offset: 0, limit: 10) {
    items {
      _id
      firstName
      lastName
      email
      phone
      status
    }
    total
    offset
    limit
  }
}
```

#### Get Customer with Orders

```graphql
query {
  customer(id: "CUST001") {
    _id
    firstName
    lastName
    email
    status
    address {
      street
      city
      state
      country
      postalCode
    }
    orders {
      _id
      total
      status
    }
  }
}
```

#### Get All Orders with Customer Info

```graphql
query {
  orders(offset: 0, limit: 10) {
    items {
      _id
      total
      status
      customer {
        firstName
        lastName
        email
      }
    }
    total
  }
}
```

### Sample Mutations

#### Create Customer

```graphql
mutation {
  createCustomer(
    input: {
      _id: "CUST002"
      firstName: "Alice"
      lastName: "Johnson"
      email: "alice@example.com"
      phone: "555-9999"
      status: "ACTIVE"
      address: {
        street: "456 Park Ave"
        city: "Mumbai"
        state: "Maharashtra"
        country: "India"
        postalCode: "400001"
      }
    }
  ) {
    _id
    firstName
    email
    status
  }
}
```

#### Update Customer

```graphql
mutation {
  updateCustomer(
    id: "CUST001"
    input: { phone: "555-1111", status: "INACTIVE" }
  ) {
    _id
    email
    phone
    status
  }
}
```

#### Create Order

```graphql
mutation {
  createOrder(
    input: { customerId: "CUST001", total: 149.99, status: "pending" }
  ) {
    _id
    total
    status
    customer {
      firstName
    }
  }
}
```

#### Delete Customer

```graphql
mutation {
  deleteCustomer(id: "507f1f77bcf86cd799439011")
}
```

## Project Structure

```
graphql-server/
├── package.json           # Dependencies and scripts
├── server.js             # Express + Apollo Server setup
├── db.js                 # MongoDB connection and CRUD methods
├── schema.graphql        # GraphQL type definitions
├── resolvers.js          # Query/Mutation/Field resolvers
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Development

### Running in Development Mode

Enable debugging with nodemon:

```bash
npm run dev
```

This runs the server with `--inspect` for debugger support.

### Connecting a Debugger

With `npm run dev` running, attach your debugger to:

- **VS Code**: Use "Attach to Process" debug configuration
- **Chrome DevTools**: Visit `chrome://inspect`
- **WebStorm**: Run → Attach to Process

## Error Handling

All resolvers implement try-catch blocks with meaningful error messages:

```
✓ "_id, firstName, lastName, and email are required" - Validation error
✓ "Customer not found: CUST001" - Not found error
✓ "customerId and total are required" - Validation error
✓ "Customer not found for foreign key" - Referential integrity error
```

Errors are logged to console and returned to GraphQL client.

## Quality Checklist

### Code Review ✓

- [x] All MongoDB collections have GraphQL types
- [x] Relationships correctly mapped (string ID references)
- [x] All CRUD operations implemented
- [x] Error handling in all resolvers
- [x] CommonJS modules throughout
- [x] Production-quality comments

### Functional Testing ✓

- [x] `npm install` succeeds
- [x] `npm start` runs without errors
- [x] GraphQL endpoint accessible
- [x] Sample queries execute
- [x] Sample mutations execute
- [x] Relationship resolvers work
- [x] Pagination works correctly
- [x] Error handling tested

## Customization

### Adding New Collections

1. **Update schema.graphql** - Add new type definitions
2. **Update resolvers.js** - Add query/mutation/field resolvers
3. **Restart server** - Changes take effect immediately

### Changing Default Port

Either set environment variable or modify `server.js`:

```bash
PORT=3000 npm start
```

### Using Remote MongoDB

Set connection string:

```bash
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net npm start
```

## Troubleshooting

**Q: Connection refused (ECONNREFUSED)**

- Ensure MongoDB is running locally or connection string is correct
- Check `MONGODB_URI` in `.env`

**Q: "objectId" is not a valid ObjectId**

- GraphQL ID arguments must be valid MongoDB ObjectIds
- Copy actual IDs from database queries

**Q: Relationship field returns null**

- Check foreign key values match ObjectIds
- Verify referenced documents exist in target collection

**Q: Slow queries with many results**

- Use pagination: `limit: 10` (default)
- Add database indexes on frequently queried fields

## Deployment

### To AWS Lambda / Serverless

Requires serverless framework setup. Refer to [serverless-apollo-server](https://www.apollographql.com/docs/apollo-server/deployment/serverless/).

### To Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 9000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t graphql-server .
docker run -p 9000:9000 graphql-server
```

## Related Skills

After setting up this server, consider:

- **Data Loaders** - Prevent N+1 query problems
- **Authentication** - Add JWT or session-based auth
- **Cursor Pagination** - Implement Relay-style connections
- **Integration Tests** - Add GraphQL query tests
- **Schema Documentation** - Auto-generate API docs

## License

ISC

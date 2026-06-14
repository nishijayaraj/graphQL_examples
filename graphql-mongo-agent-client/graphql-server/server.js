const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { ApolloServer } = require("apollo-server-express");
const { readFileSync } = require("fs");
const { join } = require("path");
const resolvers = require("./resolvers");
const { getConnection } = require("./db");

const PORT = process.env.PORT || 9000;

/**
 * Start the GraphQL server
 */
async function startServer() {
  try {
    // Initialize Express app
    const app = express();

    // Middleware
    app.use(cors());
    app.use(bodyParser.json());

    // Test MongoDB connection
    console.log("Connecting to MongoDB...");
    await getConnection();

    // Load GraphQL schema
    const typeDefs = readFileSync(join(__dirname, "schema.graphql"), "utf-8");

    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
      includeStacktraceInErrorResponses: true,
    });

    // Start Apollo Server
    await server.start();

    // Apply middleware to Express app
    server.applyMiddleware({ app });

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // Root endpoint
    app.get("/", (req, res) => {
      res.json({
        message: "GraphQL MongoDB Server",
        graphql: `/graphql`,
        playground: `/graphql`,
        health: `/health`,
      });
    });

    // Start Express server
    app.listen(PORT, () => {
      console.log("");
      console.log(
        "╔════════════════════════════════════════════════════════════╗",
      );
      console.log(
        "║          🚀 GraphQL Server is Running                       ║",
      );
      console.log(
        "╠════════════════════════════════════════════════════════════╣",
      );
      console.log(`║  GraphQL Endpoint:   http://localhost:${PORT}/graphql`);
      console.log(
        `║  GraphQL Playground: http://localhost:${PORT}/graphql       ║`,
      );
      console.log(
        `║  Health Check:       http://localhost:${PORT}/health        ║`,
      );
      console.log(
        "╚════════════════════════════════════════════════════════════╝",
      );
      console.log("");
      console.log("Sample Queries:");
      console.log("  { customers { items { id firstName } total } }");
      console.log(
        '  { customer(id: "...") { firstName email orders { total } } }',
      );
      console.log("");
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  process.exit(0);
});

startServer();

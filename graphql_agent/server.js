const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const typeDefinitions = require('./schema.graphql');
const resolvers = require('./resolvers');

// Define port from environment or default to 9000
const port = process.env.PORT || 9000;

// Create Express app
const app = express();

// Enable middleware
app.use(bodyParser.json());
app.use(cors());

// Create executable schema from type definitions and resolvers
const schema = makeExecutableSchema({
  typeDefs: typeDefinitions,
  resolvers: resolvers
});

// Mount GraphQL endpoint
app.use('/graphql', graphqlExpress({
  schema: schema,
  context: { db: require('./db') }
}));

// Mount GraphiQL interface for development
app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql'
}));

// Start the Express server
app.listen({ port }, () => {
  console.log(`🚀 GraphQL Server running at http://localhost:${port}/graphql`);
  console.log(`📊 GraphiQL interface available at http://localhost:${port}/graphiql`);
});

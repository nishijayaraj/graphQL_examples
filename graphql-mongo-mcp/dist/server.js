import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { connectMongo } from "./mongo.js";
import { inferSchema } from "./schema.js";
import { generateGraphQLQuery } from "./graphql.js";
const server = new McpServer({
    name: "mongodb-mcp",
    version: "1.0.0",
});
server.tool("ping", "Health check", {}, async () => ({
    content: [
        {
            type: "text",
            text: "pong",
        },
    ],
}));
// List database
server.tool("list_databases", {
    connectionString: z.string(),
}, async ({ connectionString }) => {
    const client = await connectMongo(connectionString);
    const result = await client.db().admin().listDatabases();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result),
            },
        ],
    };
});
//List collections
server.tool("list_collections", {
    connectionString: z.string(),
    database: z.string(),
}, async ({ connectionString, database }) => {
    const client = await connectMongo(connectionString);
    const collections = await client.db(database).listCollections().toArray();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(collections.map((c) => c.name)),
            },
        ],
    };
});
//List sample document
server.tool("sample_documents", {
    connectionString: z.string(),
    database: z.string(),
    collection: z.string(),
}, async (args) => {
    const client = await connectMongo(args.connectionString);
    const docs = await client
        .db(args.database)
        .collection(args.collection)
        .find({})
        .limit(5)
        .toArray();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(docs, null, 2),
            },
        ],
    };
});
//Infer schema
server.tool("infer_schema", {
    connectionString: z.string(),
    database: z.string(),
    collection: z.string(),
}, async (args) => {
    const client = await connectMongo(args.connectionString);
    const doc = await client
        .db(args.database)
        .collection(args.collection)
        .findOne();
    const schema = inferSchema(doc);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(schema, null, 2),
            },
        ],
    };
});
//generate GraphQL query
server.tool("generate_graphql", {
    connectionString: z.string(),
    database: z.string(),
    collection: z.string(),
}, async (args) => {
    const client = await connectMongo(args.connectionString);
    const doc = await client
        .db(args.database)
        .collection(args.collection)
        .findOne();
    const schema = inferSchema(doc);
    const gql = generateGraphQLQuery(args.collection, schema);
    return {
        content: [
            {
                type: "text",
                text: gql,
            },
        ],
    };
});
const transport = new StdioServerTransport();
await server.connect(transport);

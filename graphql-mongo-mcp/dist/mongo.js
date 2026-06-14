import { MongoClient } from "mongodb";
const clients = new Map();
export async function connectMongo(connectionString) {
    let client = clients.get(connectionString);
    if (!client) {
        client = new MongoClient(connectionString);
        await client.connect();
        clients.set(connectionString, client);
    }
    return client;
}

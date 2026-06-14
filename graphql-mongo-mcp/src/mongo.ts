import { MongoClient } from "mongodb";

const clients = new Map<string, MongoClient>();

export async function connectMongo(connectionString: string) {
  let client = clients.get(connectionString);

  if (!client) {
    client = new MongoClient(connectionString);
    await client.connect();

    clients.set(connectionString, client);
  }

  return client;
}

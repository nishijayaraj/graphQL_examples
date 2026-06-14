const { MongoClient, ObjectId } = require("mongodb");

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "crm";

let connection = null;

/**
 * Get or create MongoDB connection
 * Uses singleton pattern with connection pooling
 */
async function getConnection() {
  if (!connection) {
    const client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    try {
      await client.connect();
      const db = client.db(dbName);
      connection = { client, db };
      console.log(`✓ Connected to MongoDB: ${dbName}`);
    } catch (error) {
      console.error("✗ MongoDB connection failed:", error.message);
      throw error;
    }
  }

  return connection;
}

/**
 * Database access layer with generic CRUD methods
 */
const db = {
  /**
   * Insert a new document
   */
  async insert(collectionName, document) {
    const { db: database } = await getConnection();
    const result = await database
      .collection(collectionName)
      .insertOne(document);
    return { _id: result.insertedId, ...document };
  },

  /**
   * Find document by ID (string-based, not ObjectId)
   */
  async findById(collectionName, id) {
    const { db: database } = await getConnection();
    return database.collection(collectionName).findOne({ _id: id });
  },

  /**
   * Find multiple documents with pagination
   */
  async findMany(collectionName, filter = {}, options = {}) {
    const { db: database } = await getConnection();
    const offset = Math.max(0, options.offset || 0);
    const limit = Math.min(100, Math.max(1, options.limit || 10));

    const collection = database.collection(collectionName);
    const items = await collection
      .find(filter)
      .skip(offset)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filter);

    return { items, total, offset, limit };
  },

  /**
   * Update document by ID (string-based, not ObjectId)
   */
  async updateById(collectionName, id, updates) {
    const { db: database } = await getConnection();

    const result = await database
      .collection(collectionName)
      .findOneAndUpdate(
        { _id: id },
        { $set: updates },
        { returnDocument: "after" },
      );

    return result.value;
  },

  /**
   * Delete document by ID (string-based, not ObjectId)
   */
  async deleteById(collectionName, id) {
    const { db: database } = await getConnection();
    const result = await database
      .collection(collectionName)
      .deleteOne({ _id: id });

    return result.deletedCount > 0;
  },

  /**
   * Find documents by foreign key (string-based, not ObjectId)
   */
  async findByForeignKey(collectionName, foreignKeyField, foreignKeyValue) {
    const { db: database } = await getConnection();
    const query = {
      [foreignKeyField]: foreignKeyValue,
    };

    return database.collection(collectionName).find(query).toArray();
  },

  /**
   * Close connection
   */
  async disconnect() {
    if (connection) {
      await connection.client.close();
      connection = null;
      console.log("✓ Disconnected from MongoDB");
    }
  },
};

module.exports = { db, getConnection, ObjectId };

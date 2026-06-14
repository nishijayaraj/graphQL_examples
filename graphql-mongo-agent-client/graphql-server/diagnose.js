#!/usr/bin/env node

/**
 * MongoDB Diagnostic Script
 * Helps identify which database and collections contain your data
 */

const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";

async function diagnose() {
  const client = new MongoClient(mongoUri);

  try {
    console.log("🔍 MongoDB Diagnostic Tool");
    console.log(`📌 Connection: ${mongoUri}\n`);

    await client.connect();
    const admin = client.db().admin();

    // Get all databases
    console.log("📊 Available Databases:");
    console.log("─".repeat(50));
    const { databases } = await admin.listDatabases();

    for (const db of databases) {
      const dbInstance = client.db(db.name);
      const collections = await dbInstance.listCollections().toArray();

      if (collections.length === 0) continue;

      console.log(`\n📦 Database: "${db.name}"`);
      console.log(`   Size: ${db.sizeOnDisk?.toLocaleString()} bytes`);

      for (const col of collections) {
        const collection = dbInstance.collection(col.name);
        const count = await collection.countDocuments();

        if (count === 0) continue;

        console.log(`\n   📋 Collection: "${col.name}" (${count} documents)`);

        // Get sample document
        const sample = await collection.findOne();
        if (sample) {
          console.log(`      Sample fields: ${Object.keys(sample).join(", ")}`);
          if (sample._id) {
            console.log(`      Sample _id: ${sample._id}`);
          }
        }
      }
    }

    console.log("\n" + "─".repeat(50));
    console.log("✅ Diagnostic Complete!\n");

    console.log("📝 Recommendations:");
    console.log("─".repeat(50));
    console.log("1. Find your database name (e.g., 'test', 'myapp', etc.)");
    console.log(
      "2. Find your collection name (e.g., 'customers', 'Customer', etc.)",
    );
    console.log("3. Update .env file:");
    console.log("   MONGODB_DB=<your-database-name>");
    console.log("4. Update db.js or resolvers.js if collection name differs");
    console.log("5. Restart the server\n");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\n⚠️  Make sure MongoDB is running:");
    console.log("   brew services start mongodb-community   # macOS");
    console.log("   sudo systemctl start mongod               # Linux");
    console.log("   mongod.exe                                 # Windows");
  } finally {
    await client.close();
  }
}

diagnose();

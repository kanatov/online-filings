const { MongoClient } = require("mongodb");

async function initCollection({ uri, dbName }) {
  // Initiate Mongo client
  const mongoClient = new MongoClient(uri);
  try {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);

    // Define schema validation
    const tasksSchema = {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "status", "start-date", "due-date"],
          properties: {
            name: {
              bsonType: "string",
              minLength: 1,
              maxLength: 64,
              description: "required, must be a string",
            },
            status: {
              bsonType: "bool",
              description: "required, must be a boolean",
            },
            "start-date": {
              bsonType: "date",
              description: "required, must be a date, assigned automatically",
            },
            "due-date": {
              bsonType: "date",
              description:
                "required, must be the same day as start-date or later",
            },
            "done-date": {
              bsonType: "date",
              description: "required, must be a date, assigned automatically",
            },
          },
        },
      },
    };
    const collectionName = "tasks";

    // Create collection if doesn't exist
    const collections = await db
      .listCollections({ name: collectionName })
      .toArray();
    if (collections.length === 0) {
      await db.createCollection(collectionName, tasksSchema);
    }

    // Return validated collection
    return db.collection(collectionName);
  } catch (error) {
    console.error("Error setting up schema validation:", error);
    throw error;
  }
}

module.exports = { initCollection };

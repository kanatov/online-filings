const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env.local"),
});

const app = express();
const PORT = 3100;
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;

app.use(cors());
app.use(express.json());

async function getCollectionWithValidation(collectionName) {
  if (!collectionName) {
    console.error("Accessing collections without collection name");
    return;
  }
  const mongoClient = new MongoClient(uri);
  try {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
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

    const collections = await db
      .listCollections({ name: collectionName })
      .toArray();
    if (collections.length === 0) {
      await db.createCollection(collectionName, tasksSchema);
    }
    return db.collection(collectionName);
  } catch (error) {
    console.error("Error setting up schema validation:", error);
    throw error;
  }
}

app.get("/api/tasks", async (req, res) => {
  try {
    const collection = await getCollectionWithValidation("tasks");
    const tasks = await collection.find().toArray();
    res.json({ message: "ok", tasks });
  } catch (error) {
    console.error("Error fetching tasks", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.post("/api/task", async (req, res) => {
  const {
    name = null,
    status = false,
    "start-date": startDate = new Date(new Date().setHours(0, 0, 0, 0)),
    "due-date": dueDate = null,
  } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Missing task name" });
  }
  if (!dueDate) {
    return res.status(400).json({ error: "Missing Due Date" });
  }
  if (isNaN(new Date(dueDate).getTime())) {
    return res.status(400).json({
      error: "Invalid date format for due-date.",
    });
  }
  if (new Date(dueDate).getTime() < new Date(startDate).getTime()) {
    return res
      .status(400)
      .json({ error: "Due Date can't be less than Start Date" });
  }
  try {
    const collection = await getCollectionWithValidation("tasks");
    const result = await collection.insertOne({
      name,
      status,
      "start-date": startDate,
      "due-date": new Date(new Date(dueDate).setHours(0, 0, 0, 0)),
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding tasks", error);
    res.status(500).json({ error: "Failed to add a tasks" });
  }
});

app.listen(PORT, async () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});

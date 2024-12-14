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
let db;

app.use(cors());
app.use(express.json());

const initMongodb = async () => {
  if (!uri) {
    console.error("No MONGODB_URI in .env file");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db(process.env.MONGODB_NAME);
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
};

app.get("/api/task", async (req, res) => {
  try {
    const collection = db.collection("tasks");
    const tasks = await collection.find().toArray();
    res.json({ message: "ok", tasks });
  } catch (error) {
    console.error("Error fetching tasks", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.post("/api/task", async (req, res) => {
  const data = req.body;
  try {
    const collection = db.collection("tasks");
    const result = await collection.insertOne({ task: data.task });
    res.json({ message: "ok", result });
  } catch (error) {
    console.error("Error adding tasks", error);
    res.status(500).json({ error: "Failed to add a tasks" });
  }
});

app.listen(PORT, async () => {
  await initMongodb();
  console.log(`Backend is running on http://localhost:${PORT}`);
});

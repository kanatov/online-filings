const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const { initCollection } = require("./initCollection");

const app = express();
const PORT = 3100;
const uri = "mongodb://127.0.0.1:27017/";
const dbName = "todoList";

app.use(cors());
app.use(express.json());

// Get all tasks
app.get("/api/tasks", async (req, res) => {
  const { name, status, sort } = req.body;

  // Validate request
  if (name && name.length > 64) {
    return res.status(400).json({ error: "Name is more than 64 character" });
  }
  if (
    sort &&
    sort !== "due-date" &&
    sort !== "start-date" &&
    sort !== "done-date"
  ) {
    return res
      .status(400)
      .json({ error: "Sort field is not defined in schema" });
  }
  try {
    // Forming request
    const searchQuery = {};
    const sortQuery = {};
    if (status !== undefined) {
      searchQuery.status = status;
    }
    if (name) {
      searchQuery.name = { $regex: name, $options: "i" };
    }
    if (sort) {
      sortQuery[sort] = 1;
      searchQuery[sort] = { $exists: true };
    }

    // Initiate connection
    const collection = await initCollection({ uri, dbName });

    // Fetch data
    const tasks = await collection.find(searchQuery).sort(sortQuery).toArray();
    res.json({ message: "ok", result: tasks });
  } catch (error) {
    res.status(500).json({ "Failed to fetch tasks:": error });
  }
});

// Get a tasks by ID
app.get("/api/task/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Initiate connection
    const collection = await initCollection({ uri, dbName });

    // Fetch data
    const task = await collection.findOne({ _id: new ObjectId(id) });

    // Validating response
    if (task.matchedCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "ok", result: task });
  } catch (error) {
    res.status(500).json({ "Failed to fetch tasks": error });
  }
});

// Add Task
app.post("/api/task", async (req, res) => {
  const {
    name = null,
    status = false,
    "start-date": startDate = new Date(new Date().setHours(0, 0, 0, 0)),
    "due-date": dueDate = null,
  } = req.body;

  // Validate request
  if (!name) {
    return res.status(400).json({ error: "Missing task name" });
  }
  if (name.length > 64) {
    return res.status(400).json({ error: "Name is more than 64 character" });
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
    // Initiate connection
    const collection = await initCollection({ uri, dbName });

    // Insert data
    const result = await collection.insertOne({
      name,
      status,
      "start-date": startDate,
      "due-date": new Date(new Date(dueDate).setHours(0, 0, 0, 0)),
    });
    res.status(201).json({ message: "ok", result });
  } catch (error) {
    res.status(500).json({ "Failed to add a tasks": error });
  }
});

// Delete Task
app.delete("/api/task/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Initiate connection
    const collection = await initCollection({ uri, dbName });

    // Delete data
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    // Validating response
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "ok", result });
  } catch (error) {
    res.status(500).json({ "Failed to delete task": error });
  }
});

// Update Task
app.patch("/api/task/:id", async (req, res) => {
  const { id } = req.params;
  const { name, status, "due-date": dueDate } = req.body;

  // Validate request
  if (!name && status === undefined && !dueDate) {
    return res.status(400).json({ error: "No data to update the task" });
  }
  if (name && name.length > 64) {
    return res.status(400).json({ error: "Name is more than 64 character" });
  }
  if (status) {
    return res
      .status(400)
      .json({ error: "To complete the task use 'api/complete/{id}'" });
  }
  if (dueDate && isNaN(new Date(dueDate).getTime())) {
    return res.status(400).json({
      error: "Invalid date format for due-date.",
    });
  }

  let task;
  try {
    // Initiate connection
    const collection = await initCollection({ uri, dbName });

    // Fetch data
    task = await collection.findOne({ _id: new ObjectId(id) });

    // Validating response
    if (task.matchedCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    if (new Date(dueDate).getTime() < new Date(task["due-date"]).getTime()) {
      return res
        .status(400)
        .json({ error: "Due Date can't be less than Start Date" });
    }

    // Forming request
    const setFields = {};
    const unsetFields = {};
    if (name) setFields.name = name;
    if (task.status && status === false) {
      setFields.status = status;
    }
    if (!task.status) {
      unsetFields["done-date"] = "";
    }
    if (dueDate)
      setFields["due-date"] = new Date(new Date(dueDate).setHours(0, 0, 0, 0));

    // Update data
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: setFields, $unset: unsetFields }
    );

    // Validating response
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "ok", result });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Complete task
app.patch("/api/complete/:id", async (req, res) => {
  const { id } = req.params;
  let task;
  try {
    // Initiate connection
    const collection = await initCollection({ uri, dbName });

    // Fetch data
    task = await collection.findOne({ _id: new ObjectId(id) });

    // Validating response
    if (task.matchedCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    if (task.status === true) {
      return res.status(400).json({ error: "Task already completed" });
    }

    // Update data
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: true,
          "done-date": new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }
    );
    res.json({ message: "ok", result });
  } catch (error) {
    console.error("Error marking task as complete:", error);
    res.status(500).json({ error: "Failed to mark task as complete" });
  }
});

app.listen(PORT, async () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});

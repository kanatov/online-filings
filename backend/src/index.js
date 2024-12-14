const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3100;

app.use(bodyParser.json());
app.use(cors());

app.get("/api/task", (req, res) => {
  res.json({ message: "Get or Post task" });
});

app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});

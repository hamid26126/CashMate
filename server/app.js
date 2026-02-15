const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ADD THIS LINE
app.use("/api", require("./routes/routes"));

app.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = app;

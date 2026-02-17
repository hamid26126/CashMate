require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { initializeReminderCron } = require("./services/reminderCron");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  initializeReminderCron();
  console.log(`Server running on port ${"localhost:"+PORT}`);
});

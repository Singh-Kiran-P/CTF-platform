const cors = require("cors");
const express = require("express");
const bp = require("body-parser");
const { success, error } = require("consola");
import DB from "./database";

// Bring in the app constants
const { PORT } = require("./config");

// Init the application
const app = express();

// Middleware
app.use(cors());
app.user(bp.json());

// User Router Middleware
app.use('/api/users', require("./routes/users"))

const startApp = async () => {
  try {
    // Connect to database (make connnection to datae base, to use it through the hole app)
    await DB.on("connect", (conn) => {
      console.log("Database connected");
    });

    // Start express app
    app.listen(PORT, () =>
      success({ message: `Server started on PORT ${PORT}`, badge: true })
    );
  } catch (err) {
    error({
      message: `Unable to connect with database \n ${err}`,
      badge: true,
    });
    startApp();
  }
};

startApp();



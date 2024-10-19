// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here

const patientRoutes = require("./routes/patients.routes");
const therapistRoutes = require("./routes/therapists.routes");
const journalRoutes = require("./routes/journal.routes");
const entryRoutes = require("./routes/entry.routes");
const authRoutes = require('./routes/auth.routes')


app.use("/api/patients", patientRoutes);
app.use("/api/therapists", therapistRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/entries", entryRoutes);
app.use('/auth', authRoutes)

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;

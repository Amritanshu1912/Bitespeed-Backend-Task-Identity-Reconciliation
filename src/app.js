const express = require("express");
const bodyParser = require("body-parser");
const identifyCustomer = require("./identifyCustomer");

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/identify", identifyCustomer);

module.exports = app;

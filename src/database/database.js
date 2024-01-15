const logger = require("../utils/logger");
const { Sequelize } = require("sequelize");
const config = require("../../config/config");

// Create a Sequelize instance and connect to the database
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: "postgres",
  }
);

// Test the database connection
async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    logger.info("Database connection has been established successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
  }
}

connectToDatabase();

module.exports = sequelize;

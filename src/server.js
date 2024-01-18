const sequelize = require("./database/database");
const app = require("./app");
const logger = require("./utils/logger");

const PORT = process.env.APP_PORT || 3000;
logger.info(`Using PORT---------> ${PORT}`);

async function startServer() {
  try {
    await sequelize.sync();
    logger.info("Database synchronized successfully.");
    const server = app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
    return server;
  } catch (error) {
    logger.error("Unable to sync the database:", error);
  }
}

// Conditionally start the server based on the environment
if (process.env.NODE_ENV !== "test") {
  startServer();
}

module.exports = { startServer };

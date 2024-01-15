const sequelize = require("./src/database");
const app = require("./app");
require("dotenv").config();

const PORT = process.env.APP_PORT || 3000;

logger.info("Using PORT--------->", PORT);

async function syncDatabaseAndStartServer() {
  try {
    await sequelize.sync();
    logger.info("Database synchronized successfully.");
    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Unable to sync the database:", error);
  }
}

syncDatabaseAndStartServer();

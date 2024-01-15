const sequelize = require("./src/database");
const app = require("./app");
require("dotenv").config();

const PORT = process.env.APP_PORT || 3000;

console.log("Using PORT--------->", PORT);

async function syncDatabaseAndStartServer() {
  try {
    await sequelize.sync();
    console.log("Database synchronized successfully.");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to sync the database:", error);
  }
}

syncDatabaseAndStartServer();

const sequelize = require("./src/database"); // Import the database connection from db.js
const app = require("./src/app"); // Import the Express application from app.js
require("dotenv").config();

const PORT = process.env.APP_PORT || 3000;

console.log("using PORT--------->", PORT);

// Sync the database and start the server
sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized successfully.");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to sync the database:", error);
  });

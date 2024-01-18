require("dotenv").config();

const DB_HOST =
  process.env.NODE_ENV === "development"
    ? process.env.DB_HOST_DEV
    : process.env.DB_HOST_TEST;

module.exports = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: DB_HOST,
};

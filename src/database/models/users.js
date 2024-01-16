const { DataTypes } = require("sequelize");
const sequelize = require("../database");

// Define the User model
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hashedPassword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users", // Specify the table name
    timestamps: true,
    paranoid: true, // Enable soft deletes (deletedAt column)
    freezeTableName: true, // Prevent Sequelize from pluralizing the table name
  }
);

module.exports = User;

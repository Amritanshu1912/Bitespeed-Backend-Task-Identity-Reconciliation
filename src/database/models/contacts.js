const { DataTypes } = require("sequelize");
const sequelize = require("../database");

// Define the Contact model
const Contact = sequelize.define(
  "Contact",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    phone_number: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linked_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    link_precedence: {
      type: DataTypes.ENUM("primary", "secondary"),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: "deleted_at",
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Contact",
    tableName: "contacts", // Specify the table name
    timestamps: true,
    paranoid: true, // Enable soft deletes (deletedAt column)
    freezeTableName: true, // Prevent Sequelize from pluralizing the table name
  }
);

module.exports = Contact;

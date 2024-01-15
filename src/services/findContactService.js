const logger = require("../utils/logger");
const { Contact } = require("../database/models/contacts");

// Function to find contacts in the database based on email and phone number
async function findContacts(userEmail, userPhoneNumber) {
  try {
    // Find the count of requested email and phone number.
    const foundByEmail = await Contact.findOne({
      where: {
        email: userEmail,
      },
      order: [["id", "ASC"]],
      limit: 1,
    });
    const foundByPhone = await Contact.findOne({
      where: {
        phone_number: userPhoneNumber,
      },
      order: [["id", "ASC"]],
      limit: 1,
    });

    logger.info(
      `Found contacts by email: ${foundByEmail}, by phone: ${foundByPhone}`
    );

    return {
      foundByEmail,
      foundByPhone,
    };
  } catch (error) {
    logger.error(`Error finding contacts: ${error}`);
    throw error; // Rethrow the error for handling in upper layers
  }
}

module.exports = { findContacts };

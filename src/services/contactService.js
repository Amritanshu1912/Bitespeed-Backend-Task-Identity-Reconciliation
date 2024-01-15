// src/services/contactService.js
const { Contact } = require("../database/models/contacts");

// Function to find contacts in the database based on email and phone number
async function findContacts(userEmail, userPhoneNumber) {
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

  return {
    foundByEmail,
    foundByPhone,
  };
}

module.exports = { findContacts };

const express = require("express");
const Contact = require("../database/models/contacts");
const {
  createPrimaryContact,
  consolidateContacts,
  handleBothPrimaryContacts,
  handleBothSecondaryContacts,
  handleOneSecondaryContact,
} = require("../services/consolidateService");
const { findContacts } = require("../services/contactService");

// Identify endpoint
const identifyContact = async (req, res) => {
  try {
    const { email: userEmail, phoneNumber: userPhoneNumber } = req.body;

    // Check for empty parameters
    if (userEmail === "" && userPhoneNumber === null) {
      res.status(422).json({
        error: "Empty parameter received",
      });
    }

    // Find contacts in the database based on email and phone number
    const { foundByEmail, foundByPhone } = await findContacts(
      userEmail,
      userPhoneNumber
    );

    if (foundByEmail === null && foundByPhone === null) {
      // If the contact doesn't exist, create a new contact as the primary contact
      const newPrimaryContact = await Contact.create({
        email: userEmail,
        phone_number: userPhoneNumber,
        link_precedence: "primary",
      });

      // Send the response with an empty secondary contact array
      res.status(200).json({
        contact: {
          primaryContactId: newPrimaryContact.id,
          emails: [newPrimaryContact.email],
          phoneNumbers: [newPrimaryContact.phone_number],
          secondaryContactIds: [],
        },
      });
    } else if (foundByEmail && foundByPhone) {
      // Both contacts exist
      const sameRow = await Contact.findOne({
        where: {
          email: userEmail,
          phone_number: userPhoneNumber,
        },
      });

      if (sameRow) {
        // If the row exists where email = requested email and phone number = requested phone number,
        // no need to update rows, consolidate contact
        const foundContact = sameRow;

        const consolidatedContact = await consolidateContacts(
          foundContact,
          userEmail,
          userPhoneNumber
        );

        // Send the response
        res.status(200).json({ contact: consolidatedContact });
      } else {
        // Requested email and phone number exist in different rows.
        if (
          foundByEmail.link_precedence === "primary" &&
          foundByPhone.link_precedence === "primary"
        ) {
          // Both exist in different rows and both are primary,
          // handleBothPrimaryContacts: both exist in different rows
          const contact = await handleBothPrimaryContacts(
            foundByEmail,
            foundByPhone
          );
          // Send the response
          res.status(200).json({ contact });
        } else if (
          foundByEmail.link_precedence === "secondary" &&
          foundByPhone.link_precedence === "secondary"
        ) {
          // Both exist in different rows and both are secondary,
          // handleBothSecondaryContacts: both exist in different rows
          const contact = await handleBothSecondaryContacts(
            foundByEmail,
            foundByPhone,
            userEmail,
            userPhoneNumber
          );
          // Send the response
          res.status(200).json({ contact });
        } else {
          // One is primary and the other is secondary
          // handleOneSecondaryContact: one is primary and the other is secondary
          const contact = await handleOneSecondaryContact(
            foundByEmail,
            foundByPhone,
            userEmail,
            userPhoneNumber
          );
          // Send the response
          res.status(200).json({ contact });
        }
      }
    } else {
      // Case where ONLY EITHER phone Number OR email matches
      // Find the first contact that matches
      const foundContact = foundByEmail ? foundByEmail : foundByPhone;

      // create Primary contact
      await createPrimaryContact(foundContact, userEmail, userPhoneNumber);
      // consolidate contact
      const contact = await consolidateContacts(foundContact);
      // Send the response
      res.status(200).json({ contact });
    }
  } catch (error) {
    console.error("Error identifying contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all contacts from the Contact model.
 * @returns {Promise<Array<Object>>} - An array of contact objects.
 */
const getAllContacts = async () => {
  try {
    // Fetch all contacts from the Contact model
    const contacts = await Contact.findAll({
      attributes: { exclude: ["deletedAt"] }, // Exclude deleted contacts
      order: [["createdAt", "DESC"]], // Order by creation date, descending
    });

    // Respond with the contacts as an array of objects
    res.json(contacts.map((contact) => contact.toJSON()));
  } catch (error) {
    // Handle any errors during the database query
    console.error("Error retrieving contacts:", error);
    // Respond with a 500 Internal Server Error and a meaningful error message
    res
      .status(500)
      .json({ error: "Unable to retrieve contacts. Please try again later." });
  }
};

module.exports = { identifyContact, getAllContacts };

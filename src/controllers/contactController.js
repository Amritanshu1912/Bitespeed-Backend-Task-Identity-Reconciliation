const Contact = require("../database/models/contacts");
const {
  createContact,
  consolidateContacts,
  handleBothPrimaryContacts,
  handleOneSecondaryContact,
  handleBothSecondaryContacts,
} = require("../services/consolidateService");
const { findContacts } = require("../services/findContactService");

// Identify endpoint
const identifyContact = async (req, res) => {
  try {
    const { email: userEmail, phoneNumber: userPhoneNumber } = req.body;

    // Find contacts in the database based on email and phone number
    const { foundByEmail, foundByPhone } = await findContacts(
      userEmail,
      userPhoneNumber
    );

    let contact;

    const num = (foundByEmail ? 1 : 0) + (foundByPhone ? 1 : 0);

    switch (num) {
      case 0:
        // If the contact doesn't exist, create a new contact as the primary contact
        const newPrimaryContact = await Contact.create({
          email: userEmail,
          phone_number: userPhoneNumber,
          link_precedence: "primary",
        });

        // send response with an empty secondary contact array
        contact = {
          primaryContactId: newPrimaryContact.id,
          emails: [newPrimaryContact.email],
          phoneNumbers: [newPrimaryContact.phone_number],
          secondaryContactIds: [],
        };
        break;

      case 1:
        // Find the first contact that matches
        const foundContact = foundByEmail || foundByPhone;
        await createContact(foundContact, userEmail, userPhoneNumber);
        contact = await consolidateContacts(foundContact);
        break;

      case 2:
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

          contact = consolidatedContact;
        } else {
          // Requested email and phone number exist in different rows.
          if (
            foundByEmail.link_precedence === "primary" &&
            foundByPhone.link_precedence === "primary"
          ) {
            // Both exist in different rows and both are primary,
            // handleBothPrimaryContacts: both exist in different rows
            contact = await handleBothPrimaryContacts(
              foundByEmail,
              foundByPhone
            );
          } else if (
            foundByEmail.link_precedence === "secondary" &&
            foundByPhone.link_precedence === "secondary"
          ) {
            // Both exist in different rows and both are secondary,
            // handleBothSecondaryContacts: both exist in different rows
            contact = await handleBothSecondaryContacts(
              foundByEmail,
              foundByPhone,
              userEmail,
              userPhoneNumber
            );
          } else {
            // One is primary and the other is secondary
            // handleOneSecondaryContact: one is primary and the other is secondary
            contact = await handleOneSecondaryContact(
              foundByEmail,
              foundByPhone,
              userEmail,
              userPhoneNumber
            );
          }
        }
        break;
    }

    return res.status(200).json({ contact });
  } catch (error) {
    req.logger.error(`Error identifying contact: ${error.message}`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all contacts from the Contact model.
 * @returns {Promise<Array<Object>>} - An array of contact objects.
 */
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      attributes: { exclude: ["deletedAt"] },
      order: [["createdAt", "DESC"]],
    });

    req.logger.info("Contacts retrieved successfully -> ", contacts);
    const contactsData = contacts.map((contact) => ({ ...contact }));

    return res.json(contactsData);
  } catch (error) {
    req.logger.error(`Error retrieving contacts: ${error.message}`, error);
    return res
      .status(500)
      .json({ error: "Unable to retrieve contacts. Please try again later." });
  }
};

module.exports = { identifyContact, getAllContacts };

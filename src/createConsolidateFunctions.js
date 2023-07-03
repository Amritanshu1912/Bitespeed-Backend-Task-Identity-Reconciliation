const contacts = require("./contacts");
const { Op } = require('sequelize');


/**
 * Finds primary contact associated to a contact;
 * @param {Object} foundContact -  contact object.
 * @returns {Objects} fetched primary contact
 */
async function findPrimaryContact(contact) {
    try {
        const primaryContact =
            contact.link_precedence === "primary"
                ? contact
                : await contacts.findByPk(contact.linked_id);
        return primaryContact;
    } catch (error) {
        // Handle error when 'contacts.findByPk' fails or returns null
        console.error("Error finding primary contact:", error);
        throw error;
    }
}

/**
 * Finds secondary contacts associated to a contact;
 * @param {Object} foundContact - contact object.
 * @returns {Array} array of fetched secondary Contacts's IDs
 */
async function findSecondaryContacts(foundContact) {
    const { id, linked_id, link_precedence } = foundContact;

    try {
        const secondaryContacts = await contacts.findAll({
            attributes: ["id"],
            where: {
                linked_id: link_precedence === "primary" ? id : linked_id,
            },
        });

        const secondaryContactIdArray =
            secondaryContacts.length > 0 ? secondaryContacts.map(({ id }) => id) : [];

        return secondaryContactIdArray;
    } catch (error) {
        console.error(
            "Error finding secondary contacts from findSecondaryContacts:", error);
        throw error;
    }
}

/**
 * Creates a new contact and insert into database
 * @param {Object} foundContact - The primary contact object.
 * @param {string} email - The email address of the new contact.
 * @param {string} phoneNumber - The phone number of the new contact.
 * @throws {Error} If there is an error creating the contact.
 * @returns {Object} The newly created contact object.
 */
async function createContact(foundContact, email_, phoneNumber_) {
    try {
        console.log("entered createContact function");
        console.log("with arguments", foundContact, email_, phoneNumber_);

        const { id, linked_id, link_precedence } = foundContact;
        const createdContact = await contacts.create({
            email: email_,
            phone_number: phoneNumber_,
            linked_id: link_precedence === "primary" ? id : linked_id,
            link_precedence: "secondary",
        });
        return createdContact;
    } catch (error) {
        console.error("Error in createContact:", error);
        throw error;
    }
}

/**
 * Consolidates contacts when only either email or phoneNumber matches.
 * @param {Object} foundContact - The Contact object.
 * @throws {Error} If there is an error creating the contact.
 * @returns {Object} The consolidated contact object.
 */
async function consolidateContacts(foundContact) {
    try {
        console.log("entered consolidateContacts function");
        console.log("with arguments ->", foundContact);

        const { email, phone_number } = foundContact;

        const primaryContact = await findPrimaryContact(foundContact);

        const secondaryContactIdArray = await findSecondaryContacts(foundContact);

        // Consolidate the contact information
        const newContact = {
            primaryContactId: primaryContact.id,
            emails: Array.from(new Set([primaryContact.email, email])),
            phoneNumbers: Array.from(
                new Set([primaryContact.phone_number, phone_number])
            ),
            secondaryContactIds: secondaryContactIdArray,
        };

        return newContact;
    } catch (error) {
        console.error("Error in consolidateContacts:", error);
        throw error;
    }
}

/**
 * updates the db table and Consolidates contacts
 * when both email and phoneNumber match
 * but belong to different rows and both have LP="secondary"
 * @param {Object} foundContact - The first contact object.
 * @param {Object} foundContact2 - The second contact object.
 * @returns {Object} The consolidated contact object.
 */
async function bedrBothPrimary(foundContact, foundContact2) {
    try {
        console.log("entered bedrBothPrimary");
        console.log("with args ->", foundContact, foundContact2);

        // newer row becomes secondary, holds the id of older contact in linked_id
        const older =
            foundContact.created_at <= foundContact2.created_at
                ? foundContact
                : foundContact2;
        const newer = older === foundContact ? foundContact2 : foundContact;
        await contacts
            .update(
                {
                    linked_id: older.id,
                    link_precedence: "secondary",
                },
                { where: { [Op.or]: [{ id: newer.id }, { linked_id: newer.id }] } }
            )
            .catch((error) => {
                console.error("Error updating contacts:", error);
                throw error;
            });

        // consolidate contacts
        // find secondary contacts linked to it
        const secondaryContactIdArray = await findSecondaryContacts(older);

        const newContact = {
            primaryContactId: older.id,
            emails: Array.from(new Set([older.email, newer.email])),
            phoneNumbers: Array.from(
                new Set([older.phone_number, newer.phone_number.toString()])
            ),
            secondaryContactIds: secondaryContactIdArray,
        };
        console.log(newContact);
        return newContact;
    } catch (error) {
        // Handle potential errors
        console.error("Error in bedrBothPrimary :", error);
        throw error;
    }
}

/**
 * updates the db table and consolidates contacts
 * when both email and phoneNumber match
 * but belong to different rows, and one has LP="secondary".
 * @param {Object} foundContact - The first contact object.
 * @param {Object} foundContact2 - The second contact object.
 * @param {String} email_ - The requested email string.
 * @param {String} phoneNumber_ - The requested phoneNumber string.
 * @returns {Object} The consolidated contact object.
 */
async function bedrOneSecondary(foundContact, foundContact2, email_,
    phoneNumber_) {
    try {
        console.log("bedrOneSecondary");
        console.log(foundContact, foundContact2);

        const primaryPrecedentContact =
            foundContact.link_precedence === "primary"
                ? foundContact : foundContact2;
        const secondaryPrecedentContact =
            primaryPrecedentContact === foundContact
                ? foundContact2 : foundContact;

        const tempPrimaryContact = await findPrimaryContact(secondaryPrecedentContact);

        const older =
            primaryPrecedentContact.created_at < tempPrimaryContact.created_at
                ? primaryPrecedentContact
                : secondaryPrecedentContact;

        const newer = primaryPrecedentContact === older
            ? secondaryPrecedentContact
            : primaryPrecedentContact;

        // if older primaryPrecedentContact's linkedid === secondaryPrecedentContact's id, 
        // dont update table
        // if different, update the table's linked_id column
        if (secondaryPrecedentContact.linked_id !== primaryPrecedentContact.id) {
            // Modify all the rows where linked_id == secondaryPrecedentContact's linked_id
            // and update them to hold the value of primaryPrecContacts.id
            await contacts
                .update(
                    { linked_id: older.linked_id !== null ? older.linked_id : older.id },
                    {
                        where: {
                            [Op.or]: [
                                { id: newer.linked_id !== null ? newer.linked_id : newer.id },
                                { linked_id: newer.linked_id !== null ? newer.linked_id : newer.id },
                            ],
                        },
                    }
                )
                .catch((error) => {
                    console.error("Error updating contacts:", error);
                    throw error;
                });
        }

        const primaryContact = await findPrimaryContact(secondaryPrecedentContact);
        const secondaryContactIdArray = await findSecondaryContacts(older);
        
        // consolidate contacts
        const newContact = {
            primaryContactId: primaryContact.id,
            emails: Array.from(new Set([primaryContact.email, email_])),
            phoneNumbers: Array.from(
                new Set([primaryContact.phone_number, phoneNumber_.toString()])),
            secondaryContactIds: secondaryContactIdArray,
        };
        return newContact;
    } catch (error) {
        // Handle potential errors
        console.error("Error in bedrOneSecondary:", error);
        throw error;
    }
}

/**
 * updates the contact table and consolidates contacts
 * when both match but belong to different rows, 
 * and one's LP="primary" and others LP="secondary".
 * @param {Object} foundContact - The first contact object.
 * @param {Object} foundContact2 - The second contact object.
 * @param {String} email_ - The requested email string.
 * @param {String} phoneNumber_ - The requested phoneNumber string.
 * @returns {Object} The consolidated contact object.
 */
async function bedrBothSecondary(
    foundContact,
    foundContact2,
    email_,
    phoneNumber_
) {
    try {
        console.log("entered in bedrBothSecondary");
        console.log("with args ->", foundContact, foundContact2, email_, phoneNumber_);
        // if linked-ids are equal then both pointing to same contact,
        // then we dont have to update the table's linked_id column
        let olderContact = foundContact;
        if (foundContact.linked_id !== foundContact2.linked_id) {
            const older =
                foundContact.linked_id < foundContact2.linked_id
                    ? foundContact
                    : foundContact2;
            const newer = older === foundContact ? foundContact2 : foundContact;
            olderContact = older;
            // Modify the row where the newer's linked id is pointing to
            // and update its linked_id and link_prec field
            // and
            // Modify all rows where linked_id = newer.linked_id
            // and update the linkedid field to hold older's linked id
            await contacts
                .update(
                    {
                        linked_id: older.linked_id,
                        link_precedence: "secondary",
                    },
                    {
                        where: {
                            [Op.or]: [
                                { id: newer.linked_id },
                                { linked_id: newer.linked_id },
                            ],
                        },
                    }
                )
                .catch((error) => {
                    console.error("Error updating contacts:", error);
                    throw error;
                });
        }

        const primaryContact = findPrimaryContact(olderContact);
        const secondaryContactIdArray = findSecondaryContacts(olderContact);

        // consolidate contacts
        const newContact = {
            primaryContactId: primaryContact.id,
            emails: Array.from(new Set([primaryContact.email, email_])),
            phoneNumbers: Array.from(
                new Set([primaryContact.phone_number, phoneNumber_.toString()])
            ),
            secondaryContactIds: secondaryContactIdArray,
        };

        return newContact;
    } catch (error) {
        // Handle potential errors
        console.error("Error in bedrBothSecondary:", error);
        throw error;
    }
}

module.exports = {
    createContact,
    consolidateContacts,
    bedrBothPrimary,
    bedrOneSecondary,
    bedrBothSecondary,
};

const contacts = require("./contacts");

async function createForPrimary(foundContact, email_, phoneNumber_) {
  const createdContact = await contacts.create({
    email: email_,
    phone_number: phoneNumber_,
    linked_id: foundContact.id,
    link_precedence: "secondary",
  });
}

async function consolidateForPrimary(foundContact) {
  // find secondary contacts linked to it
  const secondaryContacts = await contacts.findAll({
    where: {
      linked_id: foundContact.id,
    },
  });
  // storing unique values in set
  const uniqueEmails = new Set([
    foundContact.email,
    ...secondaryContacts.map((contact) => contact.email),
  ]);
  const uniquePhoneNumbers = new Set([
    foundContact.phone_number,
    ...secondaryContacts.map((contact) => contact.phone_number),
  ]);
  // Consolidate the contact information
  const newContact = {
    primaryContactId: foundContact.id,
    emails: Array.from(uniqueEmails),
    phoneNumbers: Array.from(uniquePhoneNumbers),
    secondaryContactIds: secondaryContacts.map((contact) => contact.id),
  };
  return newContact;
}

async function createForSecondary(foundContact, email_, phoneNumber_) {
  const createdContact = await contacts.create({
    email: email_,
    phone_number: phoneNumber_,
    linked_id: foundContact.linked_id,
    linkPrecedence: "secondary",
  });
}

async function consolidateForSecondary(foundContact) {
  // find primary contact that the found "secondary" contact is pointing to
  const primaryContact = await contacts.findByPk(foundContact.linked_id);

  // find secondary contacts linked to it
  const secondaryContacts = await contacts.findAll({
    where: {
      linked_id: foundContact.linked_id,
    },
  });

  // storing unique values in set
  const uniqueEmails = new Set([
    primaryContact.email,
    ...secondaryContacts.map((contact) => contact.email),
  ]);
  const uniquePhoneNumbers = new Set([
    primaryContact.phone_number,
    ...secondaryContacts.map((contact) => contact.phone_number),
  ]);

  // Consolidate the contact information
  const newContact = {
    primaryContactId: foundContact.linked_id,
    emails: Array.from(uniqueEmails),
    phoneNumbers: Array.from(uniquePhoneNumbers),
    secondaryContactIds: secondaryContacts.map((c) => c.id),
  };
  return newContact;
}

async function bedrBothPrimary(foundContact, foundContact2) {
  // newer row becomes secondary, holds the id of older contact in linked_id
  const older =
    foundContact.created_at <= foundContact2.created_at
      ? foundContact
      : foundContact2;
  const newer = older === foundContact ? foundContact2 : foundContact;
  contacts.update(
    {
      linked_id: older.id,
      link_precedence: "secondary",
    },
    { where: { id: newer.id } }
  );

  // to consolidate contactsx we can use the consolidateForSecondary function
  // where the newer contact will behave like foundContact in that function
  const newContact = consolidateForSecondary(newer);

  return newContact;
}

async function bedrOneSecondary(foundContact, foundContact2) {
  const primaryPrecContact =
    foundContact.linkPrecedence === "primary" ? foundContact : foundContact2;
  const secondaryPrecContact =
    primaryPrecContact === foundContact ? foundContact2 : foundContact;

  // if secondaryPrecContact's linkedid === primaryContacts id, dont update table
  // if different, update the table's linked_id column
  if (secondaryPrecContact.linked_id !== primaryPrecContact.id) {
    // fetch all the rows where linked_id == secondaryPrecContact's linked_id
    // and update them to hold the value of primaryPrecContacts.id

    await contacts.update(
      {
        linked_id: primaryPrecContact.id,
      },
      { where: { id: secondaryPrecContact.linked_id } }
    );

    await contacts.update(
      {
        linked_id: primaryPrecContact.id,
      },
      { where: { linked_id: secondaryPrecContact.linked_id } }
    );
  }
  // to consolidate contacts we can use the consolidateForSecondary function
  // where the 'secondaryPrecContact' contact will behave like foundContact in that function
  const newContact = consolidateForSecondary(secondaryPrecContact);

  return newContact;
}

async function bedrBothSecondary(foundContact, foundContact2) {
  // find whose linkedid is smaller in value, i.e appears first in table
  // if they are equal meaning both pointing to same contact,
  // then we dont have to update the table's linked_id column
  let contactNewer;
  if (foundContact.linked_id !== foundContact2.linked_id) {
    const older =
      foundContact.linked_id < foundContact2.linked_id
        ? foundContact
        : foundContact2;
    const newer = older === foundContact ? foundContact2 : foundContact;
    contactNewer = newer;
    // fetch the row where the newer's linked id is pointing to
    // and update its linked_id and link_prec field

    await contacts.update(
      {
        linked_id: older.linked_id,
        link_precedence: "secondary",
      },
      { where: { id: newer.linked_id } }
    );

    // fetch all rows where linked_id = newer.linked_id
    // and update the linkedid field to hold older's linked id
    await contacts.update(
      {
        linked_id: older.linked_id,
      },
      { where: { linked_id: newer.linked_id } }
    );
  }
  // to consolidate contacts we can use the consolidateForSecondary function
  // where the 'newer' contact will behave like foundContact in that function
  const newContact = consolidateForSecondary(contactNewer);

  return newContact;
}

module.exports = {
  createForPrimary,
  consolidateForPrimary,
  createForSecondary,
  consolidateForSecondary,
  bedrBothPrimary,
  bedrOneSecondary,
  bedrBothSecondary,
};

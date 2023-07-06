const express = require("express");
const contacts = require("./contacts");
const sequelize = require("./database");
const { Op } = require('sequelize');
const {
  createContact,
  consolidateContacts,
  bedrBothPrimary,
  bedrOneSecondary,
  bedrBothSecondary,
} = require("./createConsolidateFunctions");

const router = express.Router();

// Identify endpoint
router.post("/", async (req, res) => {
  try {
    const { email: email_, phoneNumber: phoneNumber_ } = req.body;

    //check for empyt parameters
    if (email_ === "" && phoneNumber_ === "") {
      res.status(422).json({
        error: "Empty paramater string",
      });
    }

    const { countEmail, countPhoneNumber } = await countResults(email_, phoneNumber_);

    if (countEmail === 0 && countPhoneNumber === 0) {
      // If contact doesn't exist, create a new contact as primary
      const newContact = await contacts.create({
        email: email_,
        phone_number: phoneNumber_,
        link_precedence: "primary",
      });

      // Send the response with empty secondary contact array
      res.status(200).json({
        contact: {
          primaryContactId: newContact.id,
          emails: [newContact.email],
          phoneNumbers: [newContact.phone_number],
          secondaryContactIds: [],
        },
      });
    } else if (countEmail !== 0 && countPhoneNumber !== 0) {
      //both exists
      const foundContact = await contacts.findOne({
        where: {
          email: email_,
          phone_number: phoneNumber_,
        },
      });
      if (foundContact !== null) {
        /*
          if such a row exists where email = requested email and ph = requested ph
          no need to update rows,
          consolidate Contact
        */
        const contact = await consolidateContacts(foundContact,email_, phoneNumber_);

        // Send the response
        res.status(200).json({ contact });
      } else {
        //req email and ph exist in different rows. 
        //find first row where email - req email and fir row where email - req email
        const foundContactwithEmail = await contacts.findOne({
          where: { email: email_ },
          order: [["id", "ASC"]],
        });
        const foundContactwithPhone = await contacts.findOne({
          where: { phone_number: phoneNumber_ },
          order: [["id", "ASC"]],
        });
        if (
          foundContactwithEmail.link_precedence === "primary" &&
          foundContactwithPhone.link_precedence === "primary"
        ) {
          // both exists in different rows and both are primary,
          // bedr : both exist in different rows
          const contact = await bedrBothPrimary(
            foundContactwithEmail,
            foundContactwithPhone
          );
          // Send the response
          res.status(200).json({ contact });
        } else if (
          foundContactwithEmail.link_precedence === "secondary" &&
          foundContactwithPhone.link_precedence === "secondary"
        ) {
          // both exists in different rows and both are secondary,
          // bedr : both exist in different rows
          const contact = await bedrBothSecondary(
            foundContactwithEmail,
            foundContactwithPhone,
            email_,
            phoneNumber_
          );
          // Send the response
          res.status(200).json({ contact });
        } else {
          // one primary and one secondary
          const contact = await bedrOneSecondary(
            foundContactwithEmail,
            foundContactwithPhone,
            email_,
            phoneNumber_
          );
          // Send the response
          res.status(200).json({ contact });
        }
      }
    } else {
      // Case where only EITHER phone Number OR email matches
      // Find the first contact that macthes
      const foundContact = await contacts.findOne({
        where: {
          [Op.or]: [{ email: email_ }, { phone_number: phoneNumber_ }],
        },
        order: [["id", "ASC"]],
      });

      // create Contact
      await createContact(foundContact, email_, phoneNumber_);
      // consolidate Contact
      const contact = await consolidateContacts(foundContact);
      // Send the response
      res.status(200).json({ contact });
    }
  } catch (error) {
    console.error("Error identifying contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


async function countResults(email_, phoneNumber_) {
  // Find the count of requested email and phoneNumber.
  const countResults = await contacts.findOne({
    attributes: [
      [
        sequelize.literal(`SUM(CASE WHEN email = '${email_}' THEN 1 ELSE 0 END)`),
        "emailCount",
      ],
      [
        sequelize.literal(`SUM(CASE WHEN phone_number = '${phoneNumber_}' THEN 1 ELSE 0 END)`),
        "phoneNumberCount",
      ],
    ],
    raw: true,
  });

  const { emailCount, phoneNumberCount } = countResults;

  if (countResults && emailCount !== undefined && phoneNumberCount !== undefined) {
    // Convert count values to integers
    const countEmail = emailCount === null ? 0 : parseInt(emailCount);
    const countPhoneNumber = phoneNumberCount === null ? 0 : parseInt(phoneNumberCount);

    // Return the count results
    return {
      countEmail,
      countPhoneNumber
    };
  } else {
    console.log("Count results are undefined or missing properties");
    return null;
  }
}

module.exports = router;

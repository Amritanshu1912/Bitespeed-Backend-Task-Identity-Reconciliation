const express = require("express");
const contacts = require("./contacts");
const { Op } = require("sequelize");
const {
  createForPrimary,
  consolidateForPrimary,
  createForSecondary,
  consolidateForSecondary,
  bedrBothPrimary,
  bedrOneSecondary,
  bedrBothSecondary,
} = require("./createConsolidateFunctions");

const router = express.Router();

// Identify endpoint
router.post("/", async (req, res) => {
  try {
    const { email: email_, phoneNumber: phoneNumber_ } = req.body;

    // Find the primary contact based on email or phone_number
    const foundContact = await contacts.findOne({
      where: {
        [Op.or]: [{ email: email_ }, { phone_number: phoneNumber_ }],
      },
    });

    if (foundContact === null) {
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
    } else {
      if (
        foundContact.email === email_ &&
        foundContact.phone_number === phoneNumber_
      ) {
        // If recieved contact exists and both eail and phone_number belong to the same row
        // we dont have to create a new row, we can simply return 200 with apt payload

        if (foundContact.link_precedence === "primary") {
          // consolidate Contact when LP is Primary
          const newContact = await consolidateForPrimary(foundContact);
          // Send the response
          res.status(200).json({ newContact });
        } else {
          // consolidate Contact when LP is Secondary
          const newContact = await consolidateForSecondary(foundContact);
          // Send the response
          res.status(200).json({ newContact });
        }
      } else if (foundContact.email == email_) {
        // find contact with phonumber
        const foundContact2 = await contacts.findOne({
          where: { phone_number: phoneNumber_ },
        });

        if (foundContact2 !== null) {
          // if it exists, phNumber belongs to a different row
          // if it doesnt exist then we know that only one of the two fields matches
          // which can be handled in the next else block

          // check if both are primary, or one primary and one secondary or both secondary
          if (
            foundContact.link_precedence === "primary" &&
            foundContact2.link_precedence == "primary"
          ) {
            // both exists in different rows and both are primary,
            // bedr : both exist in different rows
            const newContact = bedrBothPrimary(foundContact, foundContact2);
            // Send the response
            res.status(200).json({ newContact });
          } else if (
            foundContact.link_precedence === "secondary" &&
            foundContact2.link_precedence == "secondary"
          ) {
            // both exists in different rows and both are secondary,
            // bedr : both exist in different rows
            const newContact = bedrBothSecondary(
              foundContact,
              foundContact2,
              email_,
              phoneNumber_
            );
            // Send the response
            res.status(200).json({ newContact });
          } else {
            // one primary and one secondary
            const newContact = bedrOneSecondary(foundContact, foundContact2);
            // Send the response
            res.status(200).json({ newContact });
          }
        }
      } else {
        // only phone Number OR email matches
        if (foundContact.link_precedence === "primary") {
          // create Contact when LP is Primary
          await createForPrimary(foundContact, email_, phoneNumber_);
          // consolidate Contact when LP is Primary
          const newContact = await consolidateForPrimary(foundContact);
          // Send the response
          res.status(200).json({ newContact });
        } else {
          // create Contact when LP is Secondary
          await createForSecondary(foundContact, email_, phoneNumber_);
          // consolidate Contact when LP is Secondary
          const newContact = await consolidateForSecondary(foundContact);
          // Send the response
          res.status(200).json({ newContact });
        }
      }
    }
  } catch (error) {
    console.error("Error identifying contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

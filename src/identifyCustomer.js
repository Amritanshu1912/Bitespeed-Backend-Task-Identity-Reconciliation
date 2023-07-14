const express = require("express");
const contacts = require("./contacts");
const sequelize = require("./database");
const { Op } = require("sequelize");
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
		if (email_ === "" && phoneNumber_ === null) {
			res.status(422).json({
				error: "Empty paramater recieved",
			});
		}

		const { foundByEmail, foundByPhone } = await findContacts(
			email_,
			phoneNumber_
		);

		if (foundByEmail === null && foundByPhone === null) {
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
		} else if (foundByEmail && foundByPhone) {
			//both exists
			const sameRow = await contacts.findOne({
				where: {
					email: email_,
					phone_number: phoneNumber_,
				},
			});

			if (sameRow) {
				/*
          if such a row exists where email = requested email and ph = requested ph
          no need to update rows,
          consolidate Contact
        */
				const foundContact = sameRow;

				const contact = await consolidateContacts(
					foundContact,
					email_,
					phoneNumber_
				);

				// Send the response
				res.status(200).json({ contact });
			} else {
				//req email and ph exist in different rows.
				if (
					foundByEmail.link_precedence === "primary" &&
					foundByPhone.link_precedence === "primary"
				) {
					// both exists in different rows and both are primary,
					// bedr : both exist in different rows
					const contact = await bedrBothPrimary(
						foundByEmail,
						foundByPhone
					);
					// Send the response
					res.status(200).json({ contact });
				} else if (
					foundByEmail.link_precedence === "secondary" &&
					foundByPhone.link_precedence === "secondary"
				) {
					// both exists in different rows and both are secondary,
					// bedr : both exist in different rows
					const contact = await bedrBothSecondary(
						foundByEmail,
						foundByPhone,
						email_,
						phoneNumber_
					);
					// Send the response
					res.status(200).json({ contact });
				} else {
					// one primary and one secondary
					const contact = await bedrOneSecondary(
						foundByEmail,
						foundByPhone,
						email_,
						phoneNumber_
					);
					// Send the response
					res.status(200).json({ contact });
				}
			}
		} else {
			// Case where ONLY EITHER phone Number OR email matches
			// Find the first contact that macthes
			const foundContact = foundByEmail ? foundByEmail : foundByPhone;

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

async function findContacts(email_, phoneNumber_) {
	// Find the count of requested email and phoneNumber.
	const foundByEmail = await contacts.findOne({
		where: {
			email: email_,
		},
		order: [["id", "ASC"]],
		limit: 1,
	});
	const foundByPhone = await contacts.findOne({
		where: {
			phone_number: phoneNumber_,
		},
		order: [["id", "ASC"]],
		limit: 1,
	});

	return {
		foundByEmail,
		foundByPhone,
	};
}

module.exports = router;

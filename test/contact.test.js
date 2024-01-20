const supertest = require("supertest");
const sequelize = require("../src/database/database");
const app = require("../src/app");
const jwt = require("jsonwebtoken");
const Contact = require("../src/database/models/contacts");
const { startServer } = require("../src/server");
const { findContacts } = require("../src/services/findContactService");
const consolidateService = require("../src/services/consolidateService");

jest.mock("jsonwebtoken");
jest.mock("../src/services/consolidateService");
jest.mock("../src/services/findContactService");

describe("Authentication Endpoints", () => {
  let testRequest;
  let appServer;
  const token = "mockedToken";

  beforeAll(async () => {
    testRequest = supertest(app);
    appServer = await startServer();
    console.log("Server started successfully.");
  });

  afterAll(async () => {
    await appServer.close();
    await sequelize.close();
    console.log("Server closed successfully.");
  });

  const beforeEachFunc = () => {
    // Reset all mocks before each test
    jest.resetAllMocks();

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { user: { id: 1, name: "Test User" } });
    });

    Contact.create = jest.fn();
    Contact.findOne = jest.fn();
    Contact.findAll = jest.fn();
  };

  const contacts = [
    {
      id: 1,
      phone_number: "1234567890",
      email: "contact1@contact1",
      linked_id: null,
      link_precedence: "primary",
      createdAt: new Date("2022-12-30T23:59:59.999Z").toISOString(),
      updatedAt: new Date("2022-12-30T23:59:59.999Z").toISOString(),
      deletedAt: null,
    },
    {
      id: 2,
      phone_number: "5678901234",
      email: "contact2@contact1",
      linked_id: 1,
      link_precedence: "secondary",
      createdAt: new Date("2022-12-31T23:59:59.999Z").toISOString(),
      updatedAt: new Date("2022-12-31T23:59:59.999Z").toISOString(),
      deletedAt: null,
    },
  ];
  const userEmail = "test@example.com";
  const userPhoneNumber = "1234567890";
  const mockUser = {
    email: "test@example.com",
    phoneNumber: "1234567890",
  };

  describe("GET /contact/contacts", () => {
    beforeEach(() => {
      beforeEachFunc();
    });

    it("should return 200 and all contacts if request is valid", async () => {
      Contact.findAll = jest.fn();
      Contact.findAll.mockResolvedValue(contacts);
      const res = await supertest(app)
        .get("/contact/contacts")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(contacts);
    });

    it("should return 200 and an empty array if no contacts exist", async () => {
      Contact.findAll = jest.fn();
      Contact.findAll.mockResolvedValue([]);

      const res = await supertest(app)
        .get("/contact/contacts")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });

    it("should return 401 if no token is provided", async () => {
      const res = await supertest(app).get("/contact/contacts");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty(
        "message",
        "Unauthorized: No token provided"
      );
    });

    it("should return 401 if token is invalid", async () => {
      jwt.verify = jest.fn().mockImplementation((token, secret, cb) => {
        cb(new jwt.JsonWebTokenError("Invalid token"));
      });

      const res = await supertest(app)
        .get("/contact/contacts")
        .set("Authorization", `Bearer invalid_token`);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message", "Unauthorized: Invalid token");
    });

    it("should return 500 if there is a database error", async () => {
      const error = new Error("Database query failed");

      Contact.findAll = jest.fn();
      Contact.findAll.mockRejectedValue(error);

      const res = await supertest(app)
        .get("/contact/contacts")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({
        error: "Unable to retrieve contacts. Please try again later.",
      });
      expect(Contact.findAll).toHaveBeenCalled();
    });
  });

  describe("POST /contact/identify", () => {
    beforeEach(() => {
      beforeEachFunc();
    });

    it("should create a new primary contact when no contact is found", async () => {
      findContacts.mockResolvedValue({
        foundByEmail: null,
        foundByPhone: null,
      });
      Contact.create.mockResolvedValue({
        id: 1,
        email: userEmail,
        phone_number: userPhoneNumber,
        link_precedence: "primary",
      });

      const response = await testRequest
        .post("/contact/identify")
        .send(mockUser);

      console.log("response---", response.body);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        contact: {
          primaryContactId: 1,
          emails: [userEmail],
          phoneNumbers: [userPhoneNumber],
          secondaryContactIds: [],
        },
      });
    });

    it("should return 422 for invalid email or phoneNumner", async () => {
      const response = await testRequest.post("/contact/identify").send({
        email: "",
        phoneNumber: userPhoneNumber,
      });
      console.log("response.body", response.body);

      expect(response.statusCode).toBe(422);
      expect(response.body.errors).toContainEqual({
        location: "body",
        msg: "Invalid email",
        path: "email",
        type: "field",
        value: "",
      });
    });

    it("should handle both primary contacts when found in different rows", async () => {
      const mockContactEmail = {
        id: 1,
        email: userEmail,
        phone_number: "5432167890",
        link_precedence: "primary",
        created_at: new Date("2021-01-01T00:00:00Z"),
      };
      const mockContactPhone = {
        id: 2,
        email: "other@example.com",
        phone_number: userPhoneNumber,
        link_precedence: "primary",
        created_at: new Date("2021-01-02T00:00:00Z"),
      };

      // Define the expected consolidated contact object
      const expectedConsolidatedContact = {
        primaryContactId: mockContactEmail.id, // Assuming mockContactEmail is older
        emails: [mockContactEmail.email, mockContactPhone.email],
        phoneNumbers: [
          mockContactEmail.phone_number,
          mockContactPhone.phone_number,
        ],
        secondaryContactIds: [], // Assuming no secondary contacts found
      };

      // Mock the findContacts function to return the mock contacts
      findContacts.mockResolvedValue({
        foundByEmail: mockContactEmail,
        foundByPhone: mockContactPhone,
      });
      Contact.findOne.mockResolvedValue(null);
      consolidateService.handleBothPrimaryContacts.mockResolvedValue(
        expectedConsolidatedContact
      );
      const response = await testRequest
        .post("/contact/identify")
        .send(mockUser);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ contact: expectedConsolidatedContact });
    });

    it("should handle both secondary contacts when found in different rows", async () => {
      const mockContactEmail = {
        id: 1,
        email: userEmail,
        phone_number: "1234567890",
        link_precedence: "secondary",
        linked_id: 3, // Assuming this is the ID of the primary contact
        created_at: new Date("2021-01-01T00:00:00Z"), // Example timestamp
      };
      const mockContactPhone = {
        id: 2,
        phone_number: userPhoneNumber,
        email: "other@example.com",
        link_precedence: "secondary",
        linked_id: 4, // Assuming this is a different ID of the primary contact
        created_at: new Date("2021-01-02T00:00:00Z"), // Example timestamp
      };
      const mockPrimaryContact = {
        id: 3,
        email: "primary@example.com",
        phone_number: "0987654321",
      };

      // Define the expected consolidated contact object
      const expectedConsolidatedContact = {
        primaryContactId: mockPrimaryContact.id,
        emails: [mockPrimaryContact.email, userEmail, mockContactPhone.email],
        phoneNumbers: [
          mockPrimaryContact.phone_number,
          mockContactEmail.phone_number,
          userPhoneNumber,
        ],
        secondaryContactIds: [mockContactEmail.id, mockContactPhone.id],
      };

      findContacts.mockResolvedValue({
        foundByEmail: mockContactEmail,
        foundByPhone: mockContactPhone,
      });

      consolidateService.findPrimaryContact.mockResolvedValue(
        mockPrimaryContact
      );
      consolidateService.findSecondaryContacts.mockResolvedValue([
        mockContactEmail.id,
        mockContactPhone.id,
      ]);

      consolidateService.handleBothSecondaryContacts.mockResolvedValue(
        expectedConsolidatedContact
      );

      const response = await testRequest
        .post("/contact/identify")
        .send(mockUser);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ contact: expectedConsolidatedContact });
    });

    it("should handle one secondary contact when found in different rows", async () => {
      const mockContactPrimary = {
        id: 1,
        email: userEmail,
        phone_number: "1234567890",
        link_precedence: "primary",
        linked_id: null, // Assuming this is the primary contact with no linked_id
        created_at: new Date("2021-01-01T00:00:00Z"), // Example timestamp
      };
      const mockContactSecondary = {
        id: 2,
        phone_number: userPhoneNumber,
        email: "secondary@example.com",
        link_precedence: "secondary",
        linked_id: 1, // Assuming this is linked to the primary contact
        created_at: new Date("2021-01-02T00:00:00Z"), // Example timestamp
      };

      // Define the expected consolidated contact object
      const expectedConsolidatedContact = {
        primaryContactId: mockContactPrimary.id,
        emails: [
          mockContactPrimary.email,
          userEmail,
          mockContactSecondary.email,
        ],
        phoneNumbers: [
          mockContactPrimary.phone_number,
          mockContactSecondary.phone_number,
          userPhoneNumber,
        ],
        secondaryContactIds: [mockContactSecondary.id],
      };

      findContacts.mockResolvedValue({
        foundByEmail: mockContactPrimary,
        foundByPhone: mockContactSecondary,
      });

      consolidateService.findPrimaryContact.mockResolvedValue(
        mockContactPrimary
      );
      consolidateService.findSecondaryContacts.mockResolvedValue([
        mockContactSecondary.id,
      ]);

      consolidateService.handleOneSecondaryContact.mockResolvedValue(
        expectedConsolidatedContact
      );

      const response = await testRequest
        .post("/contact/identify")
        .send(mockUser);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ contact: expectedConsolidatedContact });
    });

    it("should return 500 if findContacts throws an error", async () => {
      findContacts.mockRejectedValue(new Error("Database error"));

      const response = await testRequest
        .post("/contact/identify")
        .send(mockUser);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });

    it("should return 500 if Contact.create throws an error", async () => {
      findContacts.mockResolvedValue({
        foundByEmail: null,
        foundByPhone: null,
      });
      Contact.create.mockRejectedValue(new Error("Database create error"));

      const response = await testRequest
        .post("/contact/identify")
        .send(mockUser);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });
});

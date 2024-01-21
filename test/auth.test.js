const supertest = require("supertest");
const sequelize = require("../src/database/database");
const app = require("../src/app");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../src/database/models/users"); // Adjust the path to your User model
const { startServer } = require("../src/server");

jest.mock("jsonwebtoken");
jest.mock("bcrypt"); // Mock bcrypt
jest.mock("../../src/database/models/users"); // Mock the User model

describe("Authentication Endpoints", () => {
  let testRequest;
  let appServer;

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

  describe("POST /auth/signup", () => {
    const userData = {
      username: "newuser",
      password: "password123",
    };
    beforeEach(() => {
      jest.resetAllMocks();

      jwt.sign = jest.fn();
      bcrypt.hash = jest.fn();
      bcrypt.compare = jest.fn();
    });

    it("should register a new user successfully", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedpassword");
      User.create.mockResolvedValue({ id: 1, ...userData });

      const response = await supertest(app).post("/auth/signup").send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        id: 1,
        status: "User registered successfully",
      });
    });

    it("should return 409 if username already exists", async () => {
      User.findOne.mockResolvedValue(userData);

      const response = await supertest(app).post("/auth/signup").send(userData);

      expect(response.statusCode).toBe(409);
      expect(response.body).toEqual({ message: "Username already taken" });
    });

    it("should return 500 if User.create throws an error", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedpassword");
      User.create.mockRejectedValue(new Error("Database error"));

      const response = await supertest(app).post("/auth/signup").send(userData);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Error registering user" });
    });

    it("should return 500 if bcrypt.hash throws an error", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockRejectedValue(new Error("Bcrypt error"));

      const response = await supertest(app).post("/auth/signup").send(userData);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Error registering user" });
    });

    // Additional tests for validation errors
    it("should return 422 for invalid username", async () => {
      const response = await supertest(app)
        .post("/auth/signup")
        .send({ username: "", password: "password123" });

      expect(response.statusCode).toBe(422);
      expect(response.body.errors).toContainEqual({
        location: "body",
        msg: "Username is required",
        path: "username",
        type: "field",
        value: "",
      });
    });

    it("should return 422 for invalid password", async () => {
      const response = await supertest(app)
        .post("/auth/signup")
        .send({ username: "newuser", password: "short" });

      expect(response.statusCode).toBe(422);
      expect(response.body.errors).toContainEqual({
        location: "body",
        msg: "Password must be at least 6 characters",
        path: "password",
        type: "field",
        value: "short",
      });
    });

    // When a user signs up with a password that is too short (less than 6 characters), the API should return a status code of 422 and an error message indicating that the password must be at least 6 characters.

    it("should return 422 for invalid password", async () => {
      const response = await supertest(app)
        .post("/auth/signup")
        .send({ username: "newuser", password: "short" });

      expect(response.statusCode).toBe(422);
      expect(response.body.errors).toContainEqual({
        location: "body",
        msg: "Password must be at least 6 characters",
        path: "password",
        type: "field",
        value: "short",
      });
    });
  });

  describe("POST /auth/signin", () => {
    beforeEach(() => {
      jest.resetAllMocks();

      jwt.sign = jest.fn();
      bcrypt.hash = jest.fn();
      bcrypt.compare = jest.fn();
    });

    const mockUser = {
      id: 1,
      username: "testuser",
      hashedPassword: "hashedpassword",
    };
    const token = "testtoken";

    it("should create a new user and return a 201 status", async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(token);

      const user = {
        username: "newuser",
        password: "password123",
      };

      const response = await request.post("/auth/signin").send(user);

      expect(response.statusCode).toBe(201);
      expect(response.headers["auth-token"]).toBe(token);
      expect(response.body).toEqual({ token: token });
    });

    it("should return 401 for invalid username", async () => {
      User.findOne.mockResolvedValue(null);

      const response = await supertest(app)
        .post("/auth/signin")
        .send({ username: "wronguser", password: "password" });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({ error: "Invalid username." });
    });

    it("should return 401 for invalid password", async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const response = await supertest(app)
        .post("/auth/signin")
        .send({ username: "testuser", password: "wrongpassword" });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({ error: "Invalid password" });
    });

    it("should return 422 for missing username", async () => {
      const response = await supertest(app)
        .post("/auth/signin")
        .send({ password: "password" }); // No username provided

      expect(response.statusCode).toBe(422);
      expect(response.body.errors).toContainEqual({
        location: "body",
        msg: "Username is required",
        path: "username",
        type: "field",
        value: "",
      });
    });

    it("should return 422 for missing password", async () => {
      const response = await supertest(app)
        .post("/auth/signin")
        .send({ username: "testuser" }); // No password provided

      expect(response.statusCode).toBe(422);
      expect(response.body.errors).toContainEqual({
        location: "body",
        msg: "Password is required",
        path: "password",
        type: "field",
      });
    });

    it("should return 422 for missing username and password", async () => {
      const response = await supertest(app).post("/auth/signin").send({}); // No username and password provided

      expect(response.statusCode).toBe(422);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            location: "body",
            msg: "Username is required",
            path: "username",
            type: "field",
            value: "",
          }),
          expect.objectContaining({
            location: "body",
            msg: "Password is required",
            path: "password",
            type: "field",
          }),
        ])
      );
    });

    it("should return 500 if User.findOne throws an error", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));

      const response = await supertest(app)
        .post("/auth/signin")
        .send({ username: "testuser", password: "password" });

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Error signing in user" });
    });

    it("should return 500 if bcrypt.compare throws an error", async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockRejectedValue(new Error("Bcrypt error"));

      const response = await supertest(app)
        .post("/auth/signin")
        .send({ username: "testuser", password: "password" });

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Error signing in user" });
    });

    it("should return 500 if jwt.sign throws an error", async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation(() => {
        throw new Error("JWT error");
      });

      const response = await supertest(app)
        .post("/auth/signin")
        .send({ username: "testuser", password: "password" });

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Error signing in user" });
    });

    // Add more tests for different scenarios, e.g., missing fields, duplicate user, etc.
  });

  describe("POST /auth/logout", () => {
    it("should return 200 and correct response body", async () => {
      const res = await supertest(app).get("/auth/logout");

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status", "Logged out");
    });

    // Add more tests for different scenarios, e.g., missing fields, duplicate user, etc.
  });

  // Add tests for other endpoints
});

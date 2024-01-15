const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../database/models/users");

const signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username already exists in the database
    const existingUser = await User.findOne({
      where: { username: username },
    });
    if (existingUser) {
      req.logger.warn(`Username ${username} already exists`);
      return res.status(400).json({ message: "Username already taken" });
    }

    const saltRounds = 10; // or any other configurable value
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user record in the database
    await User.create({
      username: username,
      password: hashedPassword,
    });
    req.logger.info(`User ${username} registered successfully`);
    res.status(201).send({ status: "User registered successfully" });
  } catch (error) {
    req.logger.error(`Error registering user: ${error.message}`);
    res.status(500).send({ error: "Error registering user" });
  }
};

const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username: username } });
    if (!user) {
      req.logger.warn(`Invalid username ${username} or password`);
      return res.status(401).send({ error: "Invalid username or password" });
    }

    const validPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!validPassword) {
      req.logger.warn(`Invalid username ${username} or password`);
      return res.status(401).send({ error: "Invalid username or password" });
    }
    const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET);
    req.logger.info(`User ${username} signed in successfully`);
    res.header("auth-token", token).send({ token: token });
  } catch (error) {
    req.logger.error(`Error signing in user: ${error.message}`);
    res.status(500).send({ error: "Error signing in user" });
  }
};

const logout = (req, res) => {
  // As we're only creating a backend service, we don't actually need to do anything here
  // The client is responsible for removing the JWT from wherever they're storing it (e.g., localStorage)
  res.send({ status: "Logged out" });
};

module.exports = {
  signup,
  signin,
  logout,
};

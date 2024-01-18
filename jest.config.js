module.exports = {
  testEnvironment: "node", // Use the Node test environment
  testEnvironmentOptions: {
    NODE_ENV: "test",
  },
  coverageDirectory: "coverage", // Where to output coverage reports
  testMatch: ["**/test/**/*.test.js"], // Pattern to find test files
};

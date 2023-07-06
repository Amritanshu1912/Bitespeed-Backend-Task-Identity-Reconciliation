const axios = require("axios");

const api_request = async () => {
  const url = "http://localhost:3000/identify"; // Replace with the appropriate URL

  const requestBody = {
    email: "cat002@example.com", // Replace with the email or phoneNumber you want to identify
    phoneNumber: 3777771235,
  };

  try {
    const response = await axios.post(url, requestBody);
    if (response.data && typeof response.data === "object") {
      console.log("Response:", response.data);
    } else {
      console.error("Error: Invalid response format");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
};

api_request();
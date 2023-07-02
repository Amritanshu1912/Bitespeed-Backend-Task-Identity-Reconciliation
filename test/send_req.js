const axios = require("axios");

const api_request = async () => {
  const url = "http://localhost:3000/identify"; // Replace with the appropriate URL

  const requestBody = {
    email: "example@example.com", // Replace with the email or phoneNumber you want to identify
    phoneNumber: 9947583299,
  };

  try {
    const response = await axios.post(url, requestBody);
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

api_request();

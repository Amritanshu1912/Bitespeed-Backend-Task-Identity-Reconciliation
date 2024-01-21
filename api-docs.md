# API Documentation for Customer Identification Service

This document provides detailed information about the API endpoints available in the Customer Identification Service.

## Base URL

The service is accessible at `http://localhost:3000` or `http://localhost:5000` when running the development server.

### Contact Identification

- **Endpoint**: POST `/contact/identify`
- **Description**: Identify and consolidate customer contacts.
- **Request Body:**

  ```json
  {
    "email": "<string>",
    "phoneNumber": "<integer>"
  }
  ```

- **Responses:** A JSON object containing identification details.

  - `200`: Contact identified successfully. The response body contains a JSON object with the following structure:

    ```json
    {
      "contact": {
        "primaryContatctId": "<integer>",
        "emails": "<string[]>", // first element being primary contact's email
        "phoneNumbers": "<integer[]>", // first element being primary contact's phoneNumber
        "secondaryContactIds": "<integer[]>" // contact IDs that are "secondary" to the primary contact
      }
    }
    ```

  - `422`: Empty parameter received.
  - `500`: Internal server error.

### Get All Contacts

- **Endpoint**: GET `/contact/contacts`
- **Description**: Get all contacts stored in the database.
- **Responses:**

  - `200`: Contacts retrieved successfully. Returns an array of contacts.

    ```json
    [
      {
        "id": "<integer>",
        "phone_number": "<string>",
        "email": "<string>",
        "linked_id": "<integer>",
        "link_precedence": "<string>",
        "createdAt": "<string>",
        "updatedAt": "<date-time string>",
        "deletedAt": "<date-time string>"
      }
    ]
    ```

  - `500`: Internal server error.

### User Signup

- **Endpoint**: POST `/auth/signup`
- **Description**: Sign up a new user.
- **Request Body:**
  ```json
  {
    "username": "<string>",
    "password": "<string>"
  }
  ```
- **Responses:**

  - `201`: User registered successfully.

    ```json
    {
      "id": "<integer>",
      "status": "User registered successfully"
    }
    ```

  - `400`: Username already taken.
  - `422`: Empty parameter received.
  - `500`: Internal server error.

### User Signin

- **Endpoint**: POST `/auth/signin`
- **Description**: Sign in an existing user.
- **Request Body:**

  ```json
  {
    "username": "<string>",
    "password": "<string>"
  }
  ```

- **Responses:**

  - `201`: User signed in successfully. Returns a JWT token for the authenticated user.

    ```json
    {
      "token": "<string>"
    }
    ```

  - `401`: Invalid username or password.
  - `422`: Empty parameter received.
  - `500`: Internal server error.

### User Logout

- **Endpoint**: GET `/auth/logout`
- **Description**: Log out the authenticated user.
- **Responses:**

  - `200`: Logged out.
  - `500`: Internal server error.

### API Documentation

- **Endpoint**: GET `/api-docs`
- **Description**: Opens the OpenAPI server with Swagger API documentation.

## Sending Requests

### Using curl

```bash
 curl -X POST -H "Content-Type: application/json" -d '{"email":"example@example.com", "phoneNumber":"9947583299"}' http://127.0.0.1:3000/contact/identify -i
```

### Using axios

Modify the JSON body in `identifyRequest.js` and run:

```bash
cd test/ node identifyRequest.js
```

## Testing the API

Refer to the main [README](./README.md#testing) for instructions on running tests.

## Swagger Documentation

For a complete overview of all API endpoints with request and response schemas, refer to the `swagger.yaml` file located in the `src` directory.

# Customer Identity Reconciliation Web Service

This repository contains a web service that helps identify and consolidate customer information based on their contact information across multiple purchases. It exposes an /identify endpoint to receive HTTP POST requests and returns the consolidated contact information.

## API Endpoint

The web service takes two arguments, i.e. email and phoneNumber.

#### URL to send POST request

```http
  POST /identify
```

| Parameter     | Type     | Description                              |
| :------------ | :------- | :--------------------------------------- |
| `email`       | `string` | Email address of the customer (Optional) |
| `phoneNumber` | `number` | Phone number of the customer (Optional)  |

Returns an HTTP 200 response with a JSON payload containing the consolidated contact.

```json
{
	"contact":{
		"primaryContatctId": number,
		"emails": string[], // first element being email of primary contact
		"phoneNumbers": number[], // first element being phoneNumber of primary contact
		"secondaryContactIds": number[] // Array of all contact IDs that are "secondary" to the primary contact
	}
}
```

#### Example

Request:

```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "1234567890"
}
```

Success Response:

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["primary@example.com", "secondary@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": [2, 3]
  }
}
```

## Features

- Consolidates customer contacts based on email and phone number
- Supports identifying new customers and creating primary contacts
- Maintains primary and secondary contact relationships
- Provides an endpoint for identifying customers based on contact

## Processing POST Request

Post request is sent to identifyCustomer.js which takes email and phoneNumber from the req.body and queries the db table for a match. we acheive this by Op.or operator.

There are a few cases that arise. for each case we want to update database if necessary and consolidate contacts to send in response.

1. neither email nor phoneNumber matches
2. either email or phoneNumber matches
3. Both, email and phoneNumber matches and belongs to same row in db
4. Both, email and phoneNumber matches and belongs to different rows in db

These 4 cases are resolved with different functions which are being imported from a created function library in the project.

## Tech stack used

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM for PostgreSQL
- Docker

## Install instructions

### Prerequisites

Make sure you have the following dependencies installed on your machine:

- Node.js
- Docker

### Getting Started

To set up and run the FluxKart Customer Identification Web Service on your local machine, follow these steps:

1. Clone this repository to your local machine:

```bash
git clone https://github.com/your-username/fluxkart-customer-identification.git
```

2. Change into the project's directory

```bash
cd fluxkart-customer-identification
```

3. Install the required dependencies:

```bash
npm install
```

4. Start the PostgreSQL database and web service using Docker:

```bash
sudo docker-compose up
```

The web service will be running at http://localhost:3000 and is ready to recieve requests.

When the docker image is built, a SQL script is run to create database and seed it with 5 rows.

You can either use curl or axios to send post requests.

#### Method 1 : curl

open another terminal and use command.

```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"example@example.com", "phoneNumber":"9947583299"}' http://127.0.0.1:3000/identify -i

```

#### Method 2 : axios

Axios is already present in package.json file.
Open another terminal and type

```bash
cd req-sender/
```

There is a file called identifyRequest.js which uses axios library to send post request. You can change the json body's parameters. When ready to send the request, type in terminal

```bash
node identifyRequest.js
```

You should be able to see the response in terminal.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## 🔗 Links

[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://katherineoelsner.com/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/)
[![GeeksForGeeks](https://img.shields.io/badge/GeeksforGeeks-gray?style=for-the-badge&logo=geeksforgeeks&logoColor=35914c)](<(https://katherineoelsner.com/)>)

## Authors

- [@Amritanshu Singh](https://www.github.com/Amritanshu1912)

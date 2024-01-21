<div align="center"s>
<h1 align="center">Welcome to Contact Reconciliation Service 👋</h1>
<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://choosealicense.com/licenses/mit/" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a> 
    <p><i>Developed with the software and tools below.</i></p>
<img src="https://img.shields.io/badge/-Docker-004E89?lo/igo=Docker&style=flat" alt='Docker\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-Node.js-004E89?logo=Node.js&style=flat" alt='Node.js\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-Express.js-004E89?logo=Express.js&style=flat" alt='Express.js\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-PostgreSQL-004E89?logo=PostgreSQL&style=flat" alt='PostgreSQL' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-Sequelize-004E89?logo=Sequelize&style=flat" alt='Sequelize' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-Jest-004E89?logo=Jest&style=flat" alt='Jest\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-Swagger-004E89?logo=Swagger&style=flat" alt='Swagger"' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" />

  </p>
</div>
The Contact Reconciliation Backend Service streamlines customer data unification by reconciling contact information across multiple interactions. This project enhances customer identification, ensures secure user authentication, and retrieves consolidated data.

## 📚 Table of Contents

- [🔍 Overview](#overview)
- [🌟 Features](#features)
- [🌐 API Endpoints](#api-endpoints)
- [🚀 Getting Started](#getting-started)
  - [🏁 Prerequisites](#prerequisites)
  - [⚙️ Installation](#installation)
  - [🐳 Docker Deployment](#docker-deployment)
- [🛠️ Usage](#usage)
- [🖥️ Tech Stack](#tech-stack)
- [👨‍💻 Authors](#authors)
- [📜 License](#license)

## 🔍 Overview <a id="overview"></a>

The Contact Reconciliation Backend Service is a Node.js application that provides secure user authentication and efficient contact retrieval, merging customer details across transactions. This is a Node.js project with a Docker containerization setup, using Express.js for the web framework and PostgreSQL as the database. The project includes a RESTful API with authentication and contact management endpoints, as well as Swagger documentation for API exploration. The project also includes unit tests using Jest and integration tests using Supertest.

## 🌟 Features <a id="features"></a>

- **Secure Authentication**: Robust user authentication process with JWT for secure access control.
- **Contact Consolidation**: Advanced algorithms to merge customer contact data from multiple sources, ensuring a single customer view.
- **Data Retrieval**: Quick and secure access to unified customer information.
- **API Endpoints**: Well-defined endpoints for managing contacts and user accounts.
- **Swagger-Enabled**: Interactive API documentation for easy endpoint testing and exploration.
- **Testing Suite**: Comprehensive testing with Jest for unit tests and Supertest for integration tests to ensure code quality and reliability.
- **Docker Support**: Simplified deployment and scaling with Docker containerization.

## 🌐 API Endpoints <a id="api-endpoints"></a>

Refer to the [API Documentation](api-docs.md) for comprehensive API documentation. Additionally, you can explore the Swagger documentation located at `./src/swagger.yaml` which outlines the available endpoints for the Contact Reconciliation Backend Service. To access API docs via a user interface, utilize the Swagger UI, which is accessible at the /api-docs endpoint when running the server.

## 🚀 Getting Started <a id="getting-started"></a>

### Prerequisites <a id="prerequisites"></a>

Before you begin, ensure that you have the following installed on your machine:

- Node.js
- Docker

### Installation <a id="installation"></a>

1. Clone the repository:

   ```bash
   git clone https://github.com/Amritanshu1912/customer-identification-service.git
   cd customer-identification-service
   ```

2. Install dependencies: <br>

   Run `npm install` or `yarn install` in your terminal to install the necessary dependencies.

3. Configure environment:<br>

   Create a `.env` file in the root directory and populate it with the required environment variables.

4. Start the development server:<br>

   Execute `npm run dev` or `yarn dev` to start the server on the default port 5000.

### Docker Deployment <a id="docker-deployment"></a>

1. Build the Docker image:

   ```bash
    docker build -t customer-identification-service .
   ```

2. Run the Docker container:

   ```bash
   docker run -p 5000:5000 customer-identification-service
   ```

Alternatively, you can use Docker Compose to start the service:

```bash
sudo docker-compose up
```

## 🛠️ Usage <a id="usage"></a>

### Send Requests

Refer to the [API Documentation](api-docs.md) for details on sending requests and testing the API endpoints.

The service will be accessible at `http://localhost:3000` (or `http://localhost:5000` if using the development server). Use Postman, curl, or axios to send API requests.

#### Using curl

Send a request with the following command, modifying the JSON body and API endpoint as needed:

```bash
 curl -X POST -H "Content-Type: application/json" -d '{"email":"example@example.com", "phoneNumber":"9947583299"}' http://127.0.0.1:3000/contact/identify -i
```

#### Using axios

Axios is included in the `package.json`. To send a request using axios:

```bash
 cd test/ node identifyRequest.js
```

Modify the JSON body in `identifyRequest.js` as required before sending the request.

### Testing <a id="testing"></a>

Run all tests with npm or yarn:

```bash
 npm run test
```

To run a specific test file:

```bash
 npm run test ./path/to/test_file.test
```

## 🖥️ Tech Stack <a id="tech-stack"></a>

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM for PostgreSQL
- Docker
- Jest for Testing
- Swagger for api documentation

## 👨‍💻 Authors

### Amritanshu Singh <a id="authors"></a>

[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://www.github.com/Amritanshu1912)&nbsp;&nbsp;
[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/your-linkedin-username)&nbsp;&nbsp;
[![GeeksForGeeks](https://img.shields.io/badge/-GeeksForGeeks-0F9D58?style=for-the-badge&logo=geeksforgeeks&logoColor=white)](https://auth.geeksforgeeks.org/user/your-geeksforgeeks-username/profile)

## 📜 License <a id="license"></a>

Copyright © 2024 [Amritanshu Singh](https://github.com/Amritanshu1912).<br />
This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.

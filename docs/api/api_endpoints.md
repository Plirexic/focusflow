
# FocusFlow API Documentation

Version: 0.1
Base URL: `/api`

---
## Easy Access with Swagger UI

After starting the backend the full Swagger API Documentation can be found here: http://localhost:8080/swagger-ui.html

## 🧑‍💼 User Endpoints (`/api/user`)

### Get User by ID

- **Method:** `GET`
- **Endpoint:** `/api/user`
- **Query Params:**
  - `id` (Long) — ID of the user.
- **Responses:**
  - `200 OK`: User object.
  - `404 Not Found`: If the user does not exist.

---

### Register a New User

- **Method:** `POST`
- **Endpoint:** `/api/user/register`
- **Request Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "secret",
    "passwordConfirm": "secret"
  }
  ```

* **Responses:**
  * `302 FOUND`: Redirect to `/login`.
  * `400 BAD REQUEST`: Password confirmation mismatch or invalid data.
  * `409 CONFLICT`: Email already registered.

---

### Login User

* **Method:** `POST`
* **Endpoint:** `/api/user/login`
* **Query Params:**
  * `email` (String)
  * `password` (String)
* **Responses:**
  * `200 OK`: Login successful.
  * `401 UNAUTHORIZED`: Invalid credentials.

---

### Update User Profile

* **Method:** `PUT`
* **Endpoint:** `/api/user/profile`
* **Query Params:**
  * `email` (String)
* **Request Body (JSON):**

```json
{
  "firstName": "NewName",
  "lastName": "NewSurname",
  "email": "new@example.com"
}
```

* **Response:**
  * `200 OK`: Updated user object.
  * `404 Not Found`: If the user does not exist.

---

### Update User Role

* **Method:** `PUT`
* **Endpoint:** `/api/user/role`
* **Query Params:**
  * `id` (Long)
  * `role` (String) — e.g., `ADMIN`, `USER`
* **Response:**
  * `200 OK`: Confirmation message.
  * `404 Not Found`: User not found.

---

### Add User to Team

* **Method:** `POST`
* **Endpoint:** `/api/user/teams/add`
* **Query Params:**
  * `userId` (Long)
  * `teamId` (Long)
* **Response:**
  * `200 OK`: Confirmation message.
  * `404 Not Found`: User or team not found.

---

### Remove User from Team

* **Method:** `DELETE`
* **Endpoint:** `/api/user/teams/delete`
* **Query Params:**
  * `userId` (Long)
  * `teamId` (Long)
* **Response:**
  * `200 OK`: Confirmation message.
  * `404 Not Found`: User or team not found.

---

## 👥 Team Endpoints (`/api/teams`)

### Get All Teams

* **Method:** `GET`
* **Endpoint:** `/api/teams/all`
* **Response:** `200 OK` with list of teams.

---

### Get Team by ID

* **Method:** `GET`
* **Endpoint:** `/api/teams`
* **Query Params:**
  * `id` (Long)
* **Response:**
  * `200 OK`: Team object.
  * `404 Not Found`: If team not found.

---

### Create a New Team

* **Method:** `POST`
* **Endpoint:** `/api/teams/create`
* **Request Body (JSON):**

```json
{
  "name": "New Team",
  "description": "Team description",
  "creatorEmail": "creator@example.com",
  "memberEmails": ["member1@example.com", "member2@example.com"]
}
```

* **Responses:**
  * `201 CREATED`: Team created successfully.
  * `400 BAD REQUEST`: Validation errors.
  * `404 NOT FOUND`: If creator or members not found.

---

### Get Teams for a User

* **Method:** `GET`
* **Endpoint:** `/api/teams/user`
* **Query Params:**
  * `userId` (Long)
* **Response:** `200 OK` with list of teams the user belongs to.

---

## ✅ Task Endpoints (`/api/tasks`)

### Create a New Task

* **Method:** `POST`
* **Endpoint:** `/api/tasks`
* **Request Body (JSON):**

```json
{
  "creatorId": 1,
  "title": "New Task",
  "description": "Details...",
  "longDescription": "More detailed description...",
  "dueDate": "2025-06-01T12:00:00",
  "priority": "HIGH",
  "status": "OPEN",
  "assigneeEmail": "user@example.com",
  "simulateNotificationFailure": false,
}
```

* **Responses:**
  * `201 CREATED`: Task created successfully.
  * `400 BAD REQUEST`: Validation failed.
  * `404 NOT FOUND`: Creator or assignee not found.
  * `500 INTERNAL SERVER ERROR`: Unexpected errors.

---

### Get All Tasks for a User

* **Method:** `GET`
* **Endpoint:** `/api/tasks/user`
* **Query Params:**
  * `userId` (Long)
* **Response:** `200 OK` with list of tasks.

---

### Get All Tasks

* **Method:** `GET`
* **Endpoint:** `/api/tasks/all`
* **Response:** `200 OK` with list of all tasks.

---

### Get Task by ID

* **Method:** `GET`
* **Endpoint:** `/api/tasks`
* **Query Params:**
  * `id` (Long)
* **Response:**
  * `200 OK`: Task object.
  * `404 NOT FOUND`: If task not found.

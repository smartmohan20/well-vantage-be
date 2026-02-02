# WellVantage API Documentation

Welcome to the WellVantage API documentation. This document provides a comprehensive overview of the available endpoints, request payloads, and response formats.

---

## 🚀 Getting Started

### Base URL
- **Local Development:** `http://localhost:3000`
- **Prefix:** No global prefix currently configured.

### Authentication
Most endpoints require a JWT bearer token. 
- Header: `Authorization: Bearer <jwt_token>`
- Obtain a token via the `Auth` module's login or signup endpoints.

---

## 🏗️ Response Structure
All responses are standardized via a global interceptor:

<details>
<summary><b>Click to see Standard Response Format</b></summary>

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-01-31T22:05:00.000Z"
}
```
</details>

---

## 🔐 Authentication Module (`/auth`)

### 1. User Signup
Registers a new user in the system.

- **URL:** `/auth/signup`
- **Method:** `POST`
- **Auth Required:** No

<details>
<summary><b>Request Payload</b></summary>

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phoneNumber": "+1234567890" // Optional
}
```
</details>

<details>
<summary><b>Success Response</b></summary>

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": "u-123",
    "email": "user@example.com",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "createdAt": "2026-01-31T22:05:00.000Z"
  }
}
```
</details>

---

### 2. User Login
Authenticates a user and returns JWT access and refresh tokens.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth Required:** No

<details>
<summary><b>Request Payload</b></summary>

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
</details>

<details>
<summary><b>Success Response</b></summary>

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
</details>

---

### 3. Refresh Tokens
Generates new access and refresh tokens using a valid refresh token.

- **URL:** `/auth/refresh`
- **Method:** `POST`
- **Auth Required:** Yes (JWT-Refresh)
- Headers: `Authorization: Bearer <refresh_token>`

<details>
<summary><b>Success Response</b></summary>

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```
</details>

---

### 4. User Logout
Invalidates the current user session (clears refresh token in DB).

- **URL:** `/auth/logout`
- **Method:** `GET`
- **Auth Required:** Yes (JWT)

---

### 5. Google OAuth Endpoints

- **GET `/auth/google/url`**: Generates the Google Auth URL for the frontend.
- **GET `/auth/google`**: Standard Passport.js redirect to Google login.
- **GET `/auth/google/callback`**: Callback endpoint for Google redirection.
- **POST `/auth/google/signin`**: Direct sign-in using a Google ID Token (Ideal for Mobile).

<details>
<summary><b>Example: Google Signin Payload</b></summary>

```json
{
  "idToken": "google_id_token_from_client_sdk"
}
```
</details>

---

## 🏢 Business Module (`/businesses`)

### 1. Create Business
Creates a new gym/business. The creator is automatically assigned the `OWNER` role.

- **URL:** `/businesses`
- **Method:** `POST`
- **Auth Required:** Yes
- **Permissions:** `business:create:global`

<details>
<summary><b>Request Payload</b></summary>

```json
{
  "name": "Peak Fitness Gym",
  "houseNumber": "123",
  "street": "Main St",
  "city": "London",
  "state": "UK",
  "zipCode": "E1 6AN",
  "phoneNumber": "020 1234 5678",
  "mapUrl": "https://maps.google.com/...",
  "latitude": 51.5074,
  "longitude": -0.1278
}
```
</details>

---

### 2. Get All Businesses
Retrieves a list of all businesses in the system.

- **URL:** `/businesses`
- **Method:** `GET`
- **Auth Required:** Yes

---

### 3. Get Business by ID
Retrieves details for a specific business.

- **URL:** `/businesses/:id`
- **Method:** `GET`
- **Auth Required:** Yes

---

## 🏋️ Workout Module (`/workouts`)

### 1. Set Session Availability
Creates a workout session with multiple availabilities.

- **URL:** `/workouts/availabilities`
- **Method:** `POST`
- **Auth Required:** Yes
- **Permissions:** `business:manage:own`

<details>
<summary><b>Request Payload</b></summary>

```json
{
  "sessionName": "Morning HIIT",
  "businessId": "b-456",
  "availabilities": [
    {
      "startTime": "2026-02-01T08:00:00Z",
      "endTime": "2026-02-01T09:00:00Z"
    }
  ]
}
```
</details>

---

### 2. Get Availabilities for Gym
Retrieves workout sessions and their availability slots for a specific gym.

- **URL:** `/workouts/business/:businessId/availabilities`
- **Method:** `GET`
- **Auth Required:** Yes
- **Query Params:**
  - `from`: (Optional) ISO Date path to filter from.
  - `to`: (Optional) ISO Date path to filter to.

---

### 3. Add Slots to Availability
Creates granular bookable slots for an existing session availability.

- **URL:** `/workouts/availability/:id/slots`
- **Method:** `POST`
- **Auth Required:** Yes
- **Permissions:** `business:manage:own`

<details>
<summary><b>Request Payload</b></summary>

```json
{
  "slots": [
    {
      "startTime": "2026-02-01T08:00:00Z",
      "endTime": "2026-02-01T08:15:00Z"
    }
  ]
}
```
</details>

---

### 4. Get Available Slots
Retrieves all open (unbooked) slots for a particular gym.

- **URL:** `/workouts/business/:businessId/slots/available`
- **Method:** `GET`
- **Auth Required:** Yes
- **Query Params:**
  - `date`: (Optional) Filter by a specific date.

---

## 👥 Memberships Module (`/memberships`)

### 1. Create Membership
Links a user to a business with a role: `OWNER`, `EMPLOYEE`, or `MEMBER`.

- **URL:** `/memberships`
- **Method:** `POST`
- **Auth Required:** Yes

<details>
<summary><b>Request Payload</b></summary>

```json
{
  "userId": "u-123",
  "businessId": "b-456",
  "role": "MEMBER"
}
```
</details>

---

### 2. List Memberships
Retrieves all memberships.

- **URL:** `/memberships`
- **Method:** `GET`
- **Auth Required:** Yes

---

### 3. Delete Membership
Removes a user's membership (unlinks them from the business).

- **URL:** `/memberships/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes

# 👥 UserHub — User Management System

A full-stack User Management System built with **Node.js**, **Express**, **MongoDB (Mongoose)**, and **React (Vite)**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB running locally on `mongodb://localhost:27017`

### 1. Start the Backend
```bash
cd backend
npm install       # (already done)
npm run dev       # starts on http://localhost:5000
```

### 2. Start the Frontend
```bash
cd frontend
npm install       # (already done)
npm run dev       # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
user-management-system/
├── backend/
│   ├── models/
│   │   └── User.js          # Mongoose schema + all 6 indexes
│   ├── routes/
│   │   └── users.js         # CRUD API endpoints
│   ├── .env                 # MongoDB URI & port
│   ├── server.js            # Express app entry point
│   ├── index-test.js        # Index test + explain() script
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── UserForm.jsx  # Add/Edit user modal
    │   │   ├── UserList.jsx  # User grid with cards
    │   │   ├── Filters.jsx   # Search & filter controls
    │   │   └── Pagination.jsx
    │   ├── App.jsx
    │   ├── index.css         # Global design system
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🧪 MongoDB Indexes Implemented

| Index Type     | Field(s)        | Purpose                          |
|----------------|-----------------|----------------------------------|
| Single Field   | `name`          | Search users by name             |
| Compound       | `email` + `age` | Filter by email and age together |
| Multikey       | `hobbies`       | Query array of hobbies           |
| Text           | `bio`           | Full-text search on bio          |
| Hashed         | `userId`        | Sharding-ready unique lookup     |
| TTL            | `createdAt`     | Auto-expire after 24 hours       |

---

## 🔬 Running Index Tests

```bash
cd backend
node index-test.js
```

This script inserts 5 sample users and runs `.explain("executionStats")` to analyze:
- **Execution time (ms)**
- **Keys examined**
- **Documents examined**
- **Winning plan stage** (e.g., IXSCAN vs COLLSCAN)

---

## 📡 API Endpoints

| Method | Endpoint          | Description                    |
|--------|-------------------|--------------------------------|
| POST   | /api/users        | Create a new user              |
| GET    | /api/users        | Get all users (filter/sort/paginate) |
| GET    | /api/users/:id    | Get user by MongoDB _id        |
| PUT    | /api/users/:id    | Update user                    |
| DELETE | /api/users/:id    | Delete user                    |

### GET /api/users — Query Parameters

| Param    | Description                              |
|----------|------------------------------------------|
| name     | Search by name (partial, case-insensitive)|
| email    | Filter by exact email                    |
| age      | Filter by exact age                      |
| minAge   | Filter age >= minAge                     |
| maxAge   | Filter age <= maxAge                     |
| hobbies  | Comma-separated hobbies (must have ALL)  |
| search   | Full-text search on bio                  |
| sortBy   | Field to sort by (default: createdAt)    |
| order    | asc \| desc (default: desc)              |
| page     | Page number (default: 1)                 |
| limit    | Results per page (default: 10, max: 100) |

---

## 🧩 Postman Collection

Import `postman_collection.json` from the `backend/` folder to test all endpoints.

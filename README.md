# HabitForge

A habit-tracking application with a Node.js/Express backend (using Drizzle ORM and SQLite) and a React/Tailwind CSS frontend built with Vite.

## Prerequisites

- Node.js v16 or newer
- npm (comes with Node.js)

## Project Structure

```
Task4/
├─ backend/        # Express API + Drizzle ORM + SQLite
├─ frontend/       # React + Vite + Tailwind CSS
└─ README.md       # This file
```

## Getting Started

1. Clone the repository and navigate into it:

   ```bash
   git clone <your-repo-url>
   cd Task4
   ```

2. Backend Setup:

   ```bash
   cd backend
   npm install
   ```

   - Create a `.env` file in `backend/` with the following variables:
     ```dotenv
     JWT_SECRET=your_jwt_secret_key
     PORT=5000
     ```

3. Frontend Setup:

   ```bash
   cd ../frontend
   npm install
   ```

## Running the Application

### Backend

In one terminal:

```bash
cd backend
npm run dev
```

- The server will start on http://localhost:5000
- It will auto‐initialize or migrate the SQLite database (`backend/db.sqlite`).

### Frontend

In another terminal:

```bash
cd frontend
npm run dev
```

- The development server will start on http://localhost:5173
- It will proxy API calls to the backend.

## Building for Production

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Serve the `dist/` folder with any static file server:
   ```bash
   npx serve dist
   ```

## API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| POST   | /auth/register            | Register a new user                |
| POST   | /auth/login               | Login and receive a JWT            |
| POST   | /auth/logout              | Logout (client clears token)       |
| GET    | /auth/me                  | Get current authenticated user     |
| GET    | /habits                   | List all habits for the user       |
| POST   | /habits                   | Create a new habit                 |
| GET    | /habits/:id               | Get a specific habit               |
| PUT    | /habits/:id               | Update a habit                     |
| DELETE | /habits/:id               | Delete a habit                     |
| POST   | /habits/:id/toggle        | Toggle completion for a date       |
| GET    | /habits/:id/entries       | List habit entries within a range  |
| GET    | /habits/stats             | Get aggregated habit statistics    |

## Database

- The backend uses SQLite (file: `backend/db.sqlite`).
- Schema is defined in `backend/src/db/schema.js` and auto‐applied on server start.

## Notes 

used CHADCN UI blocks manual code
---

© 2025 HabitForge Project 
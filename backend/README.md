# HabitForge Backend

Backend API for the HabitForge habit tracking application.

## Features

- User authentication (register, login, logout)
- Habit management (create, read, update, delete)
- Habit tracking (mark habits as complete/incomplete)
- Streak calculation
- Progress tracking

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **SQLite**: Database
- **Drizzle ORM**: Database ORM
- **JWT**: Token-based authentication (stored in localStorage)
- **bcrypt**: Password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/habit-forge.git
cd habit-forge/backend
```

2. Install dependencies
```bash
npm install
```

3. Create a .env file
```bash
cp env.example .env
```

4. Edit the .env file with your own values

5. Start the development server
```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user info

### Habits

- `GET /api/habits` - Get all habits for the current user
- `POST /api/habits` - Create a new habit
- `GET /api/habits/:id` - Get a specific habit
- `PUT /api/habits/:id` - Update a habit
- `DELETE /api/habits/:id` - Delete a habit
- `POST /api/habits/:id/toggle` - Toggle habit completion for a specific date
- `GET /api/habits/:id/entries` - Get habit entries for a specific habit

## Database Schema

### Users
- `id` - Primary key
- `email` - User email (unique)
- `password` - Hashed password
- `name` - User name
- `createdAt` - Timestamp

### Habits
- `id` - Primary key
- `name` - Habit name
- `userId` - Foreign key to Users
- `createdAt` - Timestamp
- `currentStreak` - Current streak count
- `longestStreak` - Longest streak count

### Habit Entries
- `id` - Primary key
- `habitId` - Foreign key to Habits
- `date` - Entry date (YYYY-MM-DD)
- `completed` - Boolean
- `createdAt` - Timestamp 
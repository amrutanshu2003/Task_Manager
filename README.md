# Task Manager MERN

A modern MERN task manager with:

- Login and signup using JWT authentication
- MongoDB Atlas integration
- Task create, edit, delete, and complete flow
- Responsive modern UI built with React and Vite

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas + Mongoose
- Auth: JWT + bcryptjs

## Project Structure

```text
Task_Manager/
  client/
  server/
  package.json
```

## MongoDB Database

The backend is configured to use your MongoDB connection and the database path:

`TaskManager`

Note:

`Task Manager` with a space causes MongoDB namespace errors during collection creation, so the project uses `TaskManager` instead.

Connection is stored in:

`server/.env`

## Run Locally

```bash
npm install
npm start
```

Or:

```bash
npm run dev
```

Frontend runs on:

`http://127.0.0.1:5173`

Backend runs on:

`http://127.0.0.1:5000`

## Build Frontend

```bash
npm run build
```
Personal_Task_Manager

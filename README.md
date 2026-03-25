# HoopClub

A full-stack social media web application where users can create posts, like, comment, and manage their profiles.

## Features

* User Authentication (Register and Login)
* Create and view posts
* Like and comment on posts
* User profile with customizable details
* Media upload support
* Dashboard to manage content
* API-based data handling between frontend and backend

## Tech Stack

### Frontend

* React (Vite)
* Component-based architecture
* API integration layer

### Backend

* Node.js
* Express.js
* REST API

### Database

* Prisma ORM
* Relational database with migrations

## Project Structure

```
frontend/
  ├── components/
  ├── api/
  ├── auth/

backend/
  ├── controllers/
  ├── routes/
  ├── middleware/
  ├── prisma/
```

## Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/sPreetham42/hoopclub.git
cd hoopclub
```

### 2. Install dependencies

Frontend:

```
cd frontend
npm install
```

Backend:

```
cd backend
npm install
```

### 3. Setup environment variables

Create a `.env` file in the backend:

```
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

### 4. Run Prisma migrations

```
npx prisma migrate dev
```

### 5. Start the servers

Backend:

```
npm run dev
```

Frontend:

```
npm run dev
```

## Future Improvements

* Notifications system
* Recommendation features
* Improved responsiveness
* Deployment setup

## Author

Preetham S

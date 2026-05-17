# CodeAlpha_Simple_Social_Media_Platform

This project is a simple social media platform built for the CodeAlpha internship.

## 🚀 Tech Stack
*   **Frontend:** HTML, CSS, JavaScript
*   **Backend:** Node.js with Express.js
*   **Database:** MongoDB (Mongoose)

## 🌟 Features
1.  **User Profiles:** Create, edit, and view user profiles.
2.  **Posts & Comments:** Create posts and add comments to them.
3.  **Like/Follow System:** Like posts and follow other users.
4.  **Authentication:** Simple user registration and login.

## 📂 Project Structure
```text
CodeAlpha_Simple_Social_Media_Platform/
├── backend/                  # Express.js backend
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # Request handling logic
│   ├── models/               # Mongoose database models
│   ├── routes/               # API endpoints routing
│   ├── server.js             # Main backend application entry
│   └── package.json          # Backend dependencies
├── frontend/                 # HTML/CSS/JS frontend
│   ├── css/                  # Styling files
│   ├── js/                   # Frontend logic and API calls
│   └── index.html            # Main entry point for the frontend
└── README.md                 # Project documentation
```

## 🛠️ Step-by-Step Implementation Guide

### Step 1: Initial Setup
1.  Create the directory structure as shown above.
2.  Initialize the Node.js project in the `backend` folder:
    ```bash
    cd backend
    npm init -y
    npm install express mongoose cors dotenv bcryptjs jsonwebtoken
    npm install --save-dev nodemon
    ```

### Step 2: Backend Configuration
1.  Create a `.env` file in the `backend` directory with your MongoDB URI and a JWT secret.
2.  Set up the Express server in `server.js` and connect to the database.

### Step 3: Database Models
Create Mongoose schemas in the `backend/models/` folder:
*   `User.js`: Schema for users (username, email, password, followers, following).
*   `Post.js`: Schema for posts (author, content, likes).
*   `Comment.js`: Schema for comments (post ID, author, content).

### Step 4: API Routes & Controllers
Implement the following routes and their corresponding logic in controllers:
*   **Auth:** `POST /api/auth/register`, `POST /api/auth/login`
*   **Users:** `GET /api/users/:id`, `PUT /api/users/:id/follow`
*   **Posts:** `POST /api/posts`, `GET /api/posts`, `PUT /api/posts/:id/like`
*   **Comments:** `POST /api/posts/:postId/comments`

### Step 5: Frontend Development
1.  Build the UI in `frontend/index.html` (e.g., login screen, feed, profile view).
2.  Style the application using vanilla CSS in `frontend/css/style.css` or TailwindCSS if preferred.

### Step 6: Connecting Frontend and Backend
Use the JavaScript `fetch` API in `frontend/js/app.js` to communicate with your backend API endpoints, handle user authentication, and dynamically update the DOM with posts and comments.
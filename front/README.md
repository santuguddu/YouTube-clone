# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# YouTube Clone (MERN Stack)

Objective

Develop a full-stack YouTube clone where users can view and interact with videos using the MERN stack (MongoDB, Express, React, and Node.js).

 # Features

# Frontend (React)

Home Page

YouTube-style header

Static sidebar with toggle functionality

Filter buttons for video categories

Grid layout for video thumbnails with title, channel name, and views

User Authentication

Sign up & log in using JWT authentication

Sign-in button before authentication

Redirect to a Google form-based login/register page

Display username on successful login

Search & Filter Functionality

Search bar in the header to search videos by title

Filter buttons to sort videos by category

Video Player Page

Video player with title and description

Channel name, like & dislike buttons

Comment section with CRUD functionality (add, edit, delete comments)

Channel Page

Users can create a channel (only after signing in)

List of videos belonging to the channel

Option to edit or delete videos

Responsive Design

Fully responsive across different devices

 # Backend (Node.js, Express, MongoDB)

API Endpoints

User Authentication: Sign up, login, and JWT-based authentication

Channel Management: Create and fetch channel details

Video Management: Fetch, update, and delete videos

Comments: Add and fetch comments

Database (MongoDB)

Collections: Users, Videos, Channels, Comments

Store metadata like video URLs and thumbnails

Technologies Used

Frontend: React, React Router, Axios

Backend: Node.js, Express.js, MongoDB

Authentication: JWT (JSON Web Tokens)

Database: MongoDB (MongoDB Atlas or local instance)

Version Control: Git


# Installation & Setup
git clone  https://github.com/santuguddu/YouTube-clone/tree/main

Backend :
cd backend
npm install

frontend :

cd front
npm install

# Environment Variables

Create a .env file in the backend/ directory and add the following:  
MONGO_URI=mongodb://localhost:27017/youtube_clone
JWT_SECRET=your_secret_key
PORT=5000

# Other dependencies :
npm install express mongoose dotenv cors jsonwebtoken bcryptjs multer morgan nodemon

npm install react-router-dom axios redux react-redux 

# Run the Project 

cd final-youtube
npm start

Note : when we give npm start then simultaneously run both frontend and backend

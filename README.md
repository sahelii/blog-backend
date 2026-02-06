This is the backend for BlogApp, a platform where users can create, edit, and manage blog posts. Built with Node.js, Express.js, and MongoDB.

Features:
User authentication (signup, login, logout)
CRUD operations for blog posts
Commenting system
Firebase authentication
Technologies Used
Node.js, Express.js
MongoDB, Mongoose
Firebase
Installation and Setup
Clone the repository:

bash
Copy code
git clone https://github.com/sahelii/blogapp-backend.git
cd blogapp-backend
Install dependencies:

bash
Copy code
npm install
Set up environment variables:

Copy `.env.example` to `.env` and fill in the values. For production (e.g. Render), set **CORS** so the frontend can call the API:

- `CORS_ALLOWED_ORIGINS=https://blog-frontend-sigma-ecru.vercel.app` (comma-separated for multiple origins), or
- `FRONTEND_URL=https://blog-frontend-sigma-ecru.vercel.app`

Example minimal .env for local development:

makefile
Copy code
PORT=5000
MONGODB_URI=your_mongodb_uri

Run the application:

bash
Copy code
npm start
Deployment
The backend is deployed and can be accessed at:
https://blog-backend-2-5hun.onrender.com
 
BlogApp Frontend
https://blog-frontend-sigma-ecru.vercel.app/
You can interact with the API using this base URL.

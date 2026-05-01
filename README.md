# Team Task Manager 🚀

A full-stack, production-ready MERN (MongoDB, Express, React, Node.js) application designed to help teams organize, assign, and track project tasks efficiently. Built with modern UI aesthetics and robust Role-Based Access Control (RBAC).

## ✨ Key Features

- **Role-Based Access Control:** Secure `Admin` and `Member` roles.
  - *Admins* can create projects, assign team members, and promote other users.
  - *Members* can view and interact with projects they are explicitly assigned to.
- **Dynamic Kanban Board:** Drag-and-drop interface (`react-beautiful-dnd`) to easily move tasks between "To Do", "In Progress", and "Done" states.
- **Real-time Dashboard Analytics:** Aggregated metrics for total projects, team members, high-priority tasks, and overdue deadlines.
- **Project & Team Management:** Secure API routes and UI for building teams and assigning members to specific workspaces.
- **Robust Security:** HTTP-Only Signed Cookies for secure JWT authentication, preventing XSS and Cross-Site Request Forgery (CSRF).

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- Redux Toolkit (State Management)
- Tailwind CSS (Styling)
- React Beautiful DnD (Drag-and-Drop)
- Lucide React (Icons)
- Axios (API Client)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (NoSQL Database)
- JSON Web Tokens (JWT) & bcryptjs (Authentication)

## 🚀 Deployment Instructions (Railway)

This application is split into two directories (`/frontend` and `/backend`). The best way to deploy this to Railway is by creating two separate services in the same project.

### 1. Backend Deployment
1. Connect your GitHub repository to Railway.
2. Click **New** -> **GitHub Repo** -> Select this repository.
3. Railway will ask what to deploy. Select the `/backend` folder.
4. Go to the **Variables** tab of your new backend service and add:
   - `MONGODB_URI` (Your MongoDB Atlas connection string)
   - `JWT_SECRET` (A random string, e.g., `supersecretkey`)
   - `COOKIE_SECRET` (A random string, e.g., `cookiesecret`)
   - `NODE_ENV` = `production`
5. Go to the **Settings** tab and generate a domain. Copy this domain URL!

### 2. Frontend Deployment
1. Go back to your Railway project dashboard.
2. Click **New** -> **GitHub Repo** -> Select this repository again.
3. This time, select the `/frontend` folder.
4. Go to the **Variables** tab of the frontend service and add:
   - `VITE_BACKEND_BASE_URL` = `https://<your-backend-railway-domain>`
5. Railway will automatically detect Vite and build the React app.
6. Go to the **Settings** tab and generate a domain for your frontend. This is your Live App URL!

## 🤝 Submission Details
- **Live URL:** [Insert Railway Frontend URL Here]
- **GitHub Repository:** [Insert GitHub Repo URL Here]
- **Demo Video:** [Insert YouTube/Drive Link Here]

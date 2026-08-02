# 🍳 Tastebuds — AI-Powered Recipe & Social Cooking Platform

[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Google Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-8E44AD?logo=google&logoColor=white)](https://ai.google.dev/)
[![Socket.io](https://img.shields.io/badge/RealTime-Socket.io-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Tastebuds** is a modern, full-stack, AI-powered recipe generation and social media web application. It seamlessly combines intelligent cooking assistance, pantry tracking, real-time meal planning, and interactive community features for food enthusiasts.

---

## 🌟 Key Features

### 🤖 AI Recipe Generator & Personalization
- **Smart Generation**: Powered by the **Google Gemini API**, generate tailored recipes based on available pantry items, dietary restrictions, and cuisine preferences.
- **Dynamic Adjustments**: Calculate exact ingredient quantities based on customizable serving sizes.

### 🍱 Interactive Real-Time Meal Planner
- **Weekly Overview**: Visually schedule meals for Breakfast, Lunch, and Dinner across any week.
- **Live Syncing**: Real-time updates powered by **Socket.io** synchronize changes instantly across open tabs and devices.
- **Recipe Integration**: One-click addition of saved recipes into your weekly schedule.

### 📦 Pantry & Inventory Management
- **Ingredient Tracking**: Monitor pantry items, stock quantities, and expiry dates.
- **Low Stock & Expiry Alerts**: Visual badges for items nearing expiration or running low.
- **Automated Shopping Sync**: Missing or low pantry ingredients can be moved straight to your shopping list.

### 🛒 Smart Shopping List
- **Automated Aggregation**: Collect ingredients directly from your recipes or weekly meal plans.
- **Interactive Checklists**: Mark items as purchased and keep your kitchen organized.

### 💬 Social Community & Feed
- **Share & Explore**: Post culinary creations, photos, and links to your custom recipes.
- **Interactive Feed**: Like, comment, and engage with culinary posts from users across the platform.
- **Follow System**: Build your network of fellow cooks and view custom activity streams.

### 📨 Direct Messaging & Live Chat
- **Real-Time Messaging**: Connect 1-on-1 with other home chefs using WebSockets.
- **Typing Indicators**: Real-time typing status and instant message delivery notifications.

### 🏆 Culinary Challenges & Recipe Collections
- **Community Challenges**: Join ongoing cooking themes and submit your dish entries.
- **Custom Collections**: Bookmark and organize your favorite recipes into custom public or private collections.

---

## 🛠️ Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 18, React Router v6 |
| **Build Tool & Bundler** | Vite 7 |
| **Styling & UI Design** | Vanilla CSS Design Tokens, Glassmorphism Aesthetics, Tailwind CSS, Lucide Icons |
| **State & Notifications**| React Context API, `react-hot-toast` |
| **Backend Runtime** | Node.js (ES Modules), Express.js |
| **Database** | PostgreSQL (`pg` connection pool) |
| **AI Integration** | `@google/genai` (Google Gemini AI SDK) |
| **Real-Time Networking**| Socket.io (WebSockets with cookie/JWT authentication) |
| **Authentication** | JWT (JSON Web Tokens), `bcryptjs` password hashing |

---

## 📁 Repository Structure

```
Tastebuds-main/
├── backend/
│   ├── config/
│   │   ├── db.js             # PostgreSQL connection pool setup
│   │   └── schema.sql        # Database schema definitions & constraints
│   ├── controllers/          # Request handlers for Auth, Recipes, Pantry, Meals, Social, Chat
│   ├── middleware/           # JWT Auth, Error Handler, Admin guards
│   ├── models/               # Database query wrappers (Recipe, Pantry, MealPlan, Social)
│   ├── routes/               # API route definitions (/api/...)
│   ├── sockets/              # Socket.io connection handlers & event rooms
│   ├── utils/                # Gemini AI helper integration, Logger
│   ├── migrate.js            # Database schema migration script
│   └── server.js             # Express app & Socket.io server entry point
│
├── frontend/
│   ├── public/               # Static assets & favicon
│   ├── src/
│   │   ├── assets/           # Images & media assets
│   │   ├── components/       # Reusable UI components (Navbar, SocialFeed, PostCard, etc.)
│   │   ├── context/          # React AuthContext provider
│   │   ├── hooks/            # Custom hooks (e.g. useRevalidateOnFocus)
│   │   ├── pages/            # Application views (Dashboard, RecipeGenerator, MealPlanner, etc.)
│   │   ├── services/         # Axios API client & Socket.io connection service
│   │   ├── App.jsx           # Main routing & layout structure
│   │   ├── index.css         # Global glassmorphism styles & design tokens
│   │   └── main.jsx          # React DOM entry point
│   ├── index.html            # Vite HTML template
│   └── vite.config.js        # Vite build configuration
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
- **Node.js** (v18.x or higher) & `npm`
- **PostgreSQL** (v14.x or higher) database instance
- **Google Gemini API Key** (Obtainable from [Google AI Studio](https://aistudio.google.com/))

---

### 📥 1. Clone the Repository

```bash
git clone https://github.com/sumeetkl11/sumeetkl11-Ai-Recipe-Social-media-2.git
cd Tastebuds-main
```

---

### ⚙️ 2. Backend Setup

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory with the following variables:

   ```env
   PORT=8000
   NODE_ENV=development
   
   # Database Credentials
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=tastebuds_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   # Alternatively use DATABASE_URL=postgres://user:password@localhost:5432/tastebuds_db

   # Authentication & Security
   JWT_SECRET=your_super_secret_jwt_key_here

   # Google Gemini AI API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Initialize Database Schema**:
   Make sure your PostgreSQL server is running and the database exists, then execute the schema setup:
   ```bash
   node migrate.js
   ```

5. **Start the Backend Server**:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:8000`.

---

### 💻 3. Frontend Setup

1. **Open a new terminal window** and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**:
   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible in your browser at `http://localhost:5173`.

---

## 📡 API Reference Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| **`/api/auth/signup`** | `POST` | Register a new user account |
| **`/api/auth/login`** | `POST` | Authenticate user and issue JWT |
| **`/api/auth/me`** | `GET` | Get current logged-in user profile |
| **`/api/recipes`** | `GET / POST` | Fetch user recipes or create a custom recipe |
| **`/api/recipes/generate`** | `POST` | Generate AI recipe via Gemini engine |
| **`/api/pantry`** | `GET / POST` | Retrieve or add pantry items |
| **`/api/meal-plans/weekly`** | `GET` | Retrieve week's planned meals |
| **`/api/meal-plans`** | `POST / DELETE`| Add or delete planned meals |
| **`/api/posts`** | `GET / POST` | Fetch community feed or publish a new post |
| **`/api/messages`** | `GET / POST` | Retrieve conversation threads or send message |

---

## ⚡ WebSockets (Socket.io) Architecture

Real-time interactions are managed through dedicated rooms:
- **`user:<userId>:mealplan`**: Emits real-time meal plan creations and deletions.
- **`user:<userId>:notifications`**: Pushes live user alerts (likes, comments, follows).
- **`conversation:<conversationId>`**: Handles 1-on-1 direct messaging and typing indicators.

---

## 🏗️ Production Build

To test or generate optimized static production builds for the frontend:

```bash
cd frontend
npm run build
```

The compiled assets will be placed in `frontend/dist/`.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

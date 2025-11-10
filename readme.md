# ManKi-Baat
> *Your own personal space...*

![ManKi-Baat Logo](frontend/assets/logo.png)

A secure, full-stack mood tracking application built to demonstrate advanced **NoSQL** database concepts. This project goes beyond simple CRUD operations by implementing complex filtering, real-time analytics, and robust security practices using **MongoDB** and **Node.js**.

---

## 🎥 Live Demo

This short demo shows the dynamic filtering, search, and dark mode features.

![ManKi-Baat App Demo](frontend/assets/demo.gif)

**[Watch the full 45-second demo video on YouTube](https://youtu.be/O-AIxqS6OlQ)**

---

## ✨ Key Features

### 🔐 Security & Authentication
* **JWT Authentication:** Stateless, secure user sessions using JSON Web Tokens.
* **Password Hashing:** User passwords are securely hashed using `bcryptjs` before storage.
* **Data Isolation:** Strict backend enforcement ensures users can *only* access, edit, or delete their own data.

### 🍃 Advanced NoSQL Operations (MongoDB)
* **Complex Filtering:** Implemented a multi-condition search engine using `$or` and `$regex` for partial text matching across mood types and notes simultaneously.
* **Date Range Queries:** Utilizes MongoDB's comparison operators (`$gte`, `$lte`) to filter mood history by specific timeframes.
* **Server-Side Pagination:** Efficiently handles large datasets using `.skip()` and `.limit()` to reduce database load and improve frontend performance.
* **Database Indexing:** Custom compound indexes (`{ user: 1, date: -1 }`) were added to the Mongoose schema to optimize the most frequent query patterns (sorting a user's history by date).

### 📊 Analytics & Performance
* **Dynamic Dashboard:** Real-time data visualization using **Chart.js**, providing insights into mood distribution, weekly trends, and monthly overviews.
* **Performance Logging:** Integrated **Winston.js** logger to track API response times, query parameters, and server errors for auditing and debugging.

### 🎨 Modern UI/UX
* **Dark Mode:** Fully theme-aware interface with a persistent user preference setting (stored in `localStorage`).
* **Responsive Design:** Built with **Tailwind CSS** for a clean, accessible experience across devices.
* **Non-blocking Interactions:** Replaced standard browser alerts with custom **Toast Notifications** and aesthetic **Modals** for a seamless user experience.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla JavaScript (ES6+), Tailwind CSS, Chart.js, Feather Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JSON Web Tokens (JWT), bcryptjs |
| **Tools** | Winston (Logging), Nodemon (Dev) |

---

<details>
<summary><b>Technical Details & How to Run Locally </b> (Click to Expand)</summary>

## 🚀 How to Run Locally

Follow these steps to set up the project on your local machine.

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* A MongoDB connection string (local or MongoDB Atlas)

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/saarthak-k-goyal/ManKi-Baat.git

# Navigate to the backend folder
cd ManKi-Baat/backend

# Install dependencies
npm install

# Configure Environment Variables
# Create a .env file in the backend/ directory and add the following:
MONGO_URI=your_mongodb_connection_string
SECRET=your_jwt_secret_key

# Start the server
npm run dev

# The backend server will start running at http://localhost:5000.
```

### 2. Frontend Setup
Since the frontend uses standard HTML/JS, no build process is required.

Navigate to the frontend/ folder.

Open login.html or index.html directly in your browser.

Tip: For the best experience, use a local development server extension (like "Live Server" in VS Code) to serve the frontend files.

### 📂 Project Structure
```
ManKi-Baat/
├── backend/
│   ├── models/       # Mongoose Schemas (User.js, Mood.js)
│   ├── routes/       # API Routes (authRoutes.js, moodRoutes.js)
│   ├── middleware/   # Auth verification middleware
│   ├── logs/         # Server activity and error logs
│   ├── server.js     # Entry point for Express app
│   └── logger.js     # Winston logger configuration
│
└── frontend/
    ├── assets/       # Logos, icons, and demo images
    ├── index.html    # Main dashboard (Mood history & Filters)
    ├── stats.html    # Analytics dashboard (Charts)
    ├── script.js     # Core frontend logic (API calls, UI updates)
    ├── stats.js      # Chart rendering and data processing
    └── theme.js      # Dark mode toggle logic
```

</details>
# SkillSwap — Peer-to-Peer Skill Exchange & Group Learning Platform

> **Learn What You Want. Teach What You Know.**

SkillSwap connects learners with people who can teach the skills they need — while giving everyone a place to share what they know.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS 3.4 |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| Real-time | Socket.IO |
| Icons | Lucide React |

## 📁 Project Structure

```
Skill-Swap(FSD)/
├── client/          # React frontend (Vite + Tailwind)
│   └── src/
│       ├── api/          # Axios instance
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth & Socket providers
│       ├── hooks/        # Custom React hooks
│       ├── pages/        # Route-level pages
│       └── utils/        # Constants & helpers
├── server/          # Express backend
│   ├── config/      # DB & env configuration
│   ├── controllers/ # Request handlers
│   ├── middleware/   # Auth & error handling
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API route definitions
│   ├── services/    # Matching & credit logic
│   └── socket/      # Socket.IO event handlers
└── package.json     # Root runner (concurrently)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Clone & Install

```bash
# Install all dependencies (root + server + client)
npm run install:all
```

### 2. Configure Environment

Edit `server/.env` with your MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/skillswap?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed the Database (Optional)

```bash
cd server
node seed.js
```

This creates 8 sample users with complementary skills, 3 learning groups, and exchange requests.

**Test Accounts** (password: `password123`):
| Name | Email | Teaches | Wants to Learn |
|------|-------|---------|---------------|
| Teju | teju@skillswap.com | Python, ML | React, AWS |
| Rahul | rahul@skillswap.com | React, UI/UX | Python, SQL |
| Priya | priya@skillswap.com | Java, DSA | ML, Cloud |
| Arjun | arjun@skillswap.com | AWS, DevOps | Python, React |
| Sneha | sneha@skillswap.com | Figma, UI/UX | Java, DSA |
| Karthik | karthik@skillswap.com | SQL, MongoDB | DevOps, Cloud |
| Ananya | ananya@skillswap.com | Photoshop, Illustrator | Figma, UI/UX |
| Vikram | vikram@skillswap.com | React, Node.js | ML, AI |

### 4. Run the Application

```bash
# From root directory — starts both server and client
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Base**: http://localhost:5000/api

## ✨ Core Features

### 🔄 Smart Skill Matching
Algorithm matches users based on complementary skills with percentage scoring and mutual exchange detection.

### 🤝 Skill Exchange Requests
Send, accept, reject, or cancel skill exchange requests with other users.

### 👥 Group Learning
Create and join learning groups with roadmaps, tasks, resources, and real-time discussion.

### 💬 Real-time Group Chat
Socket.IO-powered group messaging with typing indicators.

### 📅 Learning Sessions
Schedule, join, and track learning sessions (1-on-1 or group).

### ⭐ Ratings & Reputation
Rate teachers on knowledge, communication, and helpfulness.

### 💰 Skill Credits
Earn credits by teaching, spend them learning. Encourages contribution.

### 📊 Learning Progress
Track skill progress with topic checklists and percentage bars.

### 🔔 Notifications
Real-time notifications for requests, sessions, messages, and matches.

## 🎨 Design

Custom plum/violet/coral palette — modern, premium, student-focused design.

| Color | Hex | Usage |
|-------|-----|-------|
| Plum | `#17121C` | Primary text, dark elements |
| Violet | `#9B5DE5` | Primary actions, highlights |
| Coral | `#FF6B6B` | Accents, CTAs |
| Lavender | `#F7F3FA` | Backgrounds |
| Muted Lavender | `#C8B6D9` | Borders, secondary text |

## 📡 API Endpoints

| Route | Description |
|-------|-------------|
| `POST /api/auth/register` | Register |
| `POST /api/auth/login` | Login |
| `GET /api/auth/me` | Current user |
| `GET /api/users/search` | Search users |
| `GET /api/matching` | Get skill matches |
| `POST /api/exchanges` | Send exchange request |
| `GET /api/groups` | List groups |
| `POST /api/groups` | Create group |
| `POST /api/sessions` | Schedule session |
| `POST /api/ratings` | Rate a user |
| `GET /api/progress` | Learning progress |
| `GET /api/notifications` | Notifications |

---

Built with ❤️ for peer-to-peer learning.

<<<<<<< HEAD
# studysync-ai
=======
# 🧠 StudySync AI

> An AI-powered collaborative learning & productivity SaaS platform for students and developers.

![Tech](https://img.shields.io/badge/Stack-MERN-7C5CFF)
![Status](https://img.shields.io/badge/Status-In_Development-F59E0B)
![License](https://img.shields.io/badge/License-MIT-22C55E)

## ✨ Features

- 🔐 JWT Authentication + Google OAuth + Refresh Tokens
- 👥 Realtime Collaborative Study Rooms (Socket.io)
- 🤖 AI-powered Notes Summarizer, Quiz Generator, Doubt Solver (Gemini API)
- 📊 Productivity Analytics Dashboard
- ⏱️ Pomodoro Timer, Habit Tracker, Task Manager
- 📁 Cloudinary File Uploads
- 🌗 Dark-mode first, fully responsive

## 🏗️ Tech Stack
 **Frontend:** React, Vite, Tailwind CSS, Redux Toolkit, TanStack Query, Framer Motion **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io **Auth:** JWT, Refresh Tokens, Google OAuth **AI:** Gemini API **Cloud:** Cloudinary, Vercel, Render

## 📁 Project Structure

\`\`\`
studysync-ai/
├── client/   # React frontend
├── server/   # Express backend
└── docs/     # Architecture & API docs
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- Cloudinary account
- Gemini API key

### Installation

\`\`\`bash
# Clone
git clone https://github.com/your-username/studysync-ai.git
cd studysync-ai

# Backend
cd server
cp .env.example .env  # Fill in your secrets
npm install
npm run dev

# Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev
\`\`\`

## 📜 License

MIT © 2026 Ayush Raj
>>>>>>> 802b32a (chore: initial monorepo setup with client and server foundations)

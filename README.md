# 🚀 AI-Powered Crowd Behavior Analysis Web Application

An advanced, user-friendly web application for real-time crowd behavior analysis. Built with a modern tech stack, it supports image, video, and live camera feed analysis alongside sensor integration.

## 🌟 Features

- 🔒 **User Authentication**: Secure login with simulated user accounts
- 📹 **Media Analysis**: Supports image, video, and live camera feed uploads
- 📊 **Real-time Data Visualization**: Heatmaps, density trends, and anomaly detection
- 📍 **Location Management**: Search, track, and bookmark locations
- 🔧 **Admin Dashboard**: User management, sensor control, and logs

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS, Framer Motion, Zustand, Recharts
- **Backend:** Node.js, Express, MongoDB (optional for advanced features)
- **Deployment:** Vercel (Frontend), Render/Fly.io (Backend)

---

## 🗂 Directory Structure

📁 **charanteja1230-crowd_analysis_app**

### 📌 **Frontend**
```
├── frontend/
│   ├── next.config.js
│   ├── package.json
│   ├── vercel.json
│   └── src/
│       ├── app/
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── dashboard/
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── login/
│       │   │   └── page.tsx
│       │   └── register/
│       │       └── page.tsx
│       ├── components/
│       │   ├── enhanced-search-bar.tsx
│       │   ├── live-feed-mini.tsx
│       │   ├── location-display.tsx
│       │   ├── notification-center.tsx
│       │   ├── quick-upload.tsx
│       │   ├── theme-provider.tsx
│       │   └── ui/
│       │       └── mode-toggle.tsx
│       ├── context/
│       │   └── auth-context.tsx
│       └── lib/
│           ├── utils.ts
│           └── stores/
│               ├── location-store.ts
│               └── sensor-store.ts
```

### 🔧 **Backend**
```
├── backend/
│   ├── Dockerfile
│   ├── fly.toml
│   ├── package.json
│   ├── server.js
│   └── models/
│       ├── Analysis.js
│       ├── Location.js
│       ├── Sensor.js
│       └── User.js
```

---

## 🛠️ Installation

### 🔥 Prerequisites
- Node.js (v18+)
- Vercel account (for frontend deployment)
- Render/Fly.io account (for backend deployment)

### 🔧 Setup

1️⃣ Clone the repository:
```bash
git clone https://github.com/yourusername/crowd-analyzer.git
cd crowd-analyzer
```

2️⃣ Install dependencies:
```bash
npm install
```

3️⃣ Run the development server:
```bash
npm run dev
```

4️⃣ Open [http://localhost:3000](http://localhost:3000) in your browser

---

## 🚀 Deployment

### Frontend Deployment (Vercel)
1️⃣ Push your frontend code to GitHub
2️⃣ Connect your repository to Vercel
3️⃣ Set environment variables
4️⃣ Deploy the frontend

### Backend Deployment (Render/Fly.io)
1️⃣ Push your backend code to GitHub
2️⃣ Configure environment variables
3️⃣ Deploy the backend

---

## 📌 To-Do List

- 🌟 Improve UI/UX layout
- 🔥 Enhance anomaly detection accuracy
- 📲 Add mobile responsiveness
- ⚙️ Implement WebSockets for live updates

---

## 💪 Contributing

Contributions are welcome! Feel free to fork this repo and submit pull requests.

---

## 📄 License

This project is licensed under the MIT License.

---

## ✨ Acknowledgments

- Thanks to all the amazing open-source libraries used!

🎉 **Happy Coding!** 🎉

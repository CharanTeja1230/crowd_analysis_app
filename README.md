# 🚀 AI-Powered Crowd Behavior Analysis Web Application

An advanced web app for analyzing crowd behavior using images, videos, and live feeds — powered by simulated data and interactive visualizations.

## 🎯 Features

- 🔐 **User Authentication**: Secure login with simulated accounts
- 🔍 **Real-Time Analysis**: Supports image, video, and live camera feed processing
- 🛰️ **Simulated Sensor Integration**: Mock sensor data visualization
- 📊 **Advanced Visuals**: Heatmaps, density charts, anomaly detection
- 🛠️ **Admin Dashboard**: User control, sensor monitoring, and log history

## 🛠️ Tech Stack

- 🌟 **Next.js (React)** — Framework
- 🎨 **Tailwind CSS** — Styling
- 💫 **Framer Motion** — Animations
- 📈 **Recharts** — Data visualization
- 💾 **Zustand** — State management

## 📂 Directory Structure

```bash
└── charanteja1230-crowd_analysis_app/
    ├── README.md
    ├── components.json
    ├── next.config.mjs
    ├── package.json
    ├── postcss.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── v0-user-next.config.js
    ├── v0-user-next.config.mjs
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
    ├── components/
    │   ├── enhanced-search-bar.tsx
    │   ├── file-uploader.tsx
    │   ├── live-feed-mini.tsx
    │   ├── location-display.tsx
    │   ├── mode-toggle.tsx
    │   ├── notification-center.tsx
    │   ├── notifications.tsx
    │   ├── quick-upload.tsx
    │   ├── search-bar.tsx
    │   ├── theme-provider.tsx
    │   ├── dashboard/
    │   │   ├── anomaly-detection.tsx
    │   │   ├── current-density.tsx
    │   │   ├── density-trends.tsx
    │   │   ├── heat-map.tsx
    │   │   ├── predictions.tsx
    │   │   └── sensor-data.tsx
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx
    │       ├── hover-card.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── menubar.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       └── separator.tsx
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
    │       ├── context/
    │       │   └── auth-context.tsx
    │       └── lib/
    │           ├── utils.ts
    │           └── stores/
    │               ├── location-store.ts
    │               └── sensor-store.ts
    └── styles/
        └── globals.css
```

## 🔧 Installation

1️⃣ **Clone the repository**
```bash
git clone https://github.com/charanteja1230/crowd_analysis_app.git
cd crowd_analysis_app
```

2️⃣ **Install dependencies**
```bash
npm install
```

3️⃣ **Run development server**
```bash
npm run dev
```

## 🚀 Deployment

- **Frontend**: Deploy via Vercel
- **Backend**: Deploy on Fly.io, Railway, or Render (Docker support included)

## 📢 Future Enhancements

- 🔧 Real IoT sensor integration
- 📍 Dynamic map visualizations
- 🧠 Improved AI anomaly detection

---


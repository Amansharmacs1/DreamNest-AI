# 🏡 DreamNest AI

> **Design your dream home in minutes using AI.**

DreamNest AI is an AI-powered home planning platform that transforms user preferences into intelligent floor plans and interactive home visualizations. Users simply describe their dream home through an intuitive guided experience, and DreamNest AI generates optimized layouts, helping them visualize, customize, and plan their future home.

---

## ✨ Features

* 🏠 Modern and responsive user interface
* 📝 Guided home preference wizard
* 📐 Intelligent rule-based floor plan generation
* 🗺️ Interactive 2D floor plan viewer
* ✏️ Drag-and-drop room editing
* 🔄 Undo & Redo functionality
* 🔍 Pan & Zoom controls
* 📏 Scale indicator
* 🧭 Plot orientation indicator
* 🎨 Color-coded room visualization
* 📄 Export designs as PDF
* 🖼️ Export floor plans as PNG
* 💾 Automatic state management
* ✅ Form validation
* 🌙 Dark mode support
* 📱 Fully responsive design

---

# 🚀 Future Enhancements

* 🏡 Interactive 3D home visualization
* 🤖 AI-powered design recommendations
* 🛋️ Automatic furniture placement
* 🌞 Sunlight & shadow simulation
* 🌬️ Ventilation analysis
* 💰 Construction cost estimation
* 🧱 Material recommendations
* 🗣️ Natural language home planning
* 📤 Shareable project links
* 👥 Real-time collaboration
* 📲 Progressive Web App (PWA)

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* Zustand
* React Hook Form
* Zod
* Axios
* SVG

## Backend

* Node.js
* Express.js
* TypeScript

## Database

* MongoDB
* Mongoose

## Planned Technologies

* Three.js
* React Three Fiber
* Blender
* OpenAI API / Gemini API

---

# 🏗️ Architecture

```text
                User
                  │
                  ▼
        Home Preference Wizard
                  │
                  ▼
       Rule-Based Layout Engine
                  │
                  ▼
          Layout JSON Output
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
   2D Floor Plan      Future 3D Renderer
```

---

# 📂 Project Structure

```text
DreamNest-AI
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── viewer
│   │   ├── forms
│   │   ├── hooks
│   │   ├── services
│   │   ├── store
│   │   ├── utils
│   │   ├── types
│   │   └── assets
│
├── backend
│   ├── src
│   │   ├── algorithms
│   │   ├── controllers
│   │   ├── routes
│   │   ├── services
│   │   ├── middleware
│   │   ├── models
│   │   ├── config
│   │   └── utils
│
└── README.md
```

---

# ⚙️ Getting Started

### Clone the repository

```bash
git clone https://github.com/your-username/DreamNest-AI.git
cd DreamNest-AI
```

### Install frontend

```bash
cd frontend
npm install
npm run dev
```

### Install backend

```bash
cd backend
npm install
npm run dev
```

---

# 🌐 Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

CLIENT_URL=http://localhost:5173
```

---

# 📸 Screenshots

Screenshots and demo GIFs will be added soon.

---

# 💡 Why DreamNest AI?

Planning a home is often complex, time-consuming, and requires multiple iterations. DreamNest AI simplifies the process by combining intelligent layout generation with an intuitive interface, allowing users to quickly transform their ideas into practical home designs.

---

# 🤝 Contributing

Contributions, suggestions, and feature requests are always welcome.

1. Fork the repository.
2. Create a new branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

# 📄 License

This project is licensed under the **MIT License**.

---

# ⭐ Support

If you found this project helpful, consider giving it a **⭐ Star** on GitHub.

It helps support the project and motivates future development.

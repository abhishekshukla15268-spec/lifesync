# LifeSync

A modern, production-ready activity tracking dashboard built with React, Vite, and Tailwind CSS.

![LifeSync Dashboard](https://via.placeholder.com/800x400?text=LifeSync+Dashboard)

## ✨ Features

- **📊 Dashboard Overview** - Weekly activity grid with completion tracking
- **📈 Analytics** - Category performance charts and activity trends
- **⚙️ Settings** - CRUD operations for activities and categories
- **📱 Responsive Design** - Works seamlessly on desktop and mobile
- **🎨 Modern UI** - Beautiful interface with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/lifesync.git
cd lifesync

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 📁 Project Structure

```
lifesync/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── index.js
│   │   ├── Dashboard.jsx
│   │   ├── CategorySpecific.jsx
│   │   ├── MasterData.jsx
│   │   ├── Sidebar.jsx
│   │   └── index.js
│   ├── data/
│   │   └── mockData.js
│   ├── utils/
│   │   └── dateUtils.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
└── .gitignore
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Recharts | Charts & Visualizations |
| Lucide React | Icons |
| ESLint | Code Linting |
| Prettier | Code Formatting |

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## 🌐 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import project in Vercel
3. Deploy automatically

### Netlify

1. Push your code to GitHub
2. Connect repository in Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### GitHub Pages

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐳 Docker Deployment

You can run the entire application (frontend + backend + database) using Docker.

### Prerequisites

- Docker
- Docker Compose

### Run with Docker Compose

```bash
# Build and start the container
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:3001`.

Data is persisted in `server/lifesync.db`.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using React and Vite

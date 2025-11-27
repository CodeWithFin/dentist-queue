# Dentist Clinic Queue Management System

A comprehensive full-stack queue management system for dental clinics with real-time updates, priority queuing, and multi-dashboard support.

## Features

- **Patient Check-in**: Walk-in or appointment-based check-in system
- **Priority Queue**: Emergency > Urgent > Appointment > Normal Walk-in
- **Real-time Updates**: Live queue position and ETA updates via WebSocket
- **Multi-Dashboard**: Separate interfaces for patients, reception, and dentists
- **Room Management**: Track room availability and occupancy
- **Notifications**: Real-time notifications for queue changes
- **Full Testing Suite**: Unit, integration, and E2E tests

## Tech Stack

### Backend
- Node.js + TypeScript
- NestJS
- PostgreSQL (Prisma ORM)
- Redis (Queue & Cache)
- WebSocket (Socket.io)

### Frontend
- React + TypeScript
- Material UI
- Socket.io Client
- React Query

### Testing
- Jest + Supertest (Backend)
- React Testing Library (Frontend)
- Cypress (E2E)

### Deployment
- Docker + Docker Compose
- Nginx

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL
- Redis

### Development Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd dentist-queue-management-system
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

4. Start services with Docker:
```bash
docker-compose up -d postgres redis
```

5. Run database migrations:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

6. Start development servers:
```bash
npm run dev
```

- Backend API: http://localhost:3000
- Frontend: http://localhost:5173

### Production Deployment

```bash
docker-compose up -d
```

Access the application at http://localhost

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:3000/api
- Health Check: http://localhost:3000/health

## Testing

### Local Testing

```bash
# Run all tests
npm run test

# Backend tests only
npm run test:backend

# Frontend tests only
npm run test:frontend

# E2E tests
npm run test:e2e
```

### TestSprite Automated Testing

Test your application with AI-powered TestSprite:

```bash
# 1. Start the application
./start.sh

# 2. Follow TestSprite setup guide
See TESTSPRITE_QUICKSTART.md for 5-minute setup
See TESTSPRITE_GUIDE.md for comprehensive guide
```

**Quick TestSprite Setup:**
1. Sign up at https://www.testsprite.com/
2. Create new project with URL: http://localhost:5173
3. Import testsprite.config.json (optional)
4. Run automated tests!

**Documentation:**
- 🚀 Quick Start: [docs/QUICK_SETUP.md](docs/QUICK_SETUP.md)
- 📚 API Reference: [docs/API.md](docs/API.md)
- 🚀 Deployment Guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- 📱 SMS Setup: [docs/SMS_QUICK_SETUP.md](docs/SMS_QUICK_SETUP.md)
- 🧪 TestSprite Testing: [docs/TESTSPRITE_QUICKSTART.md](docs/TESTSPRITE_QUICKSTART.md)
- 📖 Full Documentation: [docs/](docs/)

## Documentation

```
├── backend/              # NestJS backend API
│   ├── src/
│   │   ├── patients/     # Patient management
│   │   ├── appointments/ # Appointment scheduling
│   │   ├── queue/        # Queue management
│   │   ├── rooms/        # Room management
│   │   ├── providers/    # Dentist/Provider management
│   │   ├── notifications/# Notification system
│   │   ├── sms/          # SMS integration (Twilio)
│   │   ├── websocket/    # WebSocket gateway (real-time)
│   │   ├── redis/        # Redis cache service
│   │   └── prisma/       # Prisma service
│   ├── prisma/           # Database schema & migrations
│   └── test/             # Backend tests
├── frontend/             # Staff dashboard (React)
│   ├── src/
│   │   ├── components/   # Shared UI components
│   │   ├── pages/        # Dashboard pages
│   │   ├── services/     # API client services
│   │   └── test/         # Frontend tests
│   └── cypress/          # E2E tests
├── booking-frontend/     # Patient booking portal (React)
│   └── src/
│       ├── components/   # Booking UI components
│       └── pages/        # Booking pages
├── docs/                 # Documentation
│   ├── API.md           # API documentation
│   ├── DEPLOYMENT.md    # Deployment guide
│   ├── QUICK_SETUP.md   # Quick setup guide
│   ├── SMS_*.md         # SMS integration docs
│   ├── TESTSPRITE_*.md  # TestSprite testing docs
│   └── *.md             # Other guides
├── scripts/              # Utility scripts
├── nginx/               # Nginx reverse proxy config
├── logs/                # Application logs
├── docker-compose.yml   # Docker orchestration
├── package.json         # Root package config
└── README.md            # This file
```

## License

MIT


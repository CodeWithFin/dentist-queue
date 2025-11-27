# Project Structure

This document describes the organization of the Dentist Queue Management System.

## Directory Layout

```
dentist-queue-management-system/
├── backend/                    # NestJS Backend API
│   ├── src/                   # Source code
│   │   ├── appointments/      # Appointment scheduling module
│   │   ├── notifications/     # Notification system
│   │   ├── patients/          # Patient management
│   │   ├── providers/         # Dentist/Provider management
│   │   ├── queue/             # Queue management (core feature)
│   │   ├── redis/             # Redis cache service
│   │   ├── rooms/             # Treatment room management
│   │   ├── sms/               # SMS integration (Twilio)
│   │   ├── websocket/         # Real-time WebSocket gateway
│   │   ├── prisma/            # Prisma database service
│   │   ├── app.module.ts      # Root application module
│   │   └── main.ts            # Application entry point
│   ├── prisma/                # Database layer
│   │   ├── schema.prisma      # Database schema definition
│   │   ├── migrations/        # Database migrations
│   │   ├── seed.ts            # Database seeder
│   │   └── seed-service-types.ts
│   ├── test/                  # Backend tests
│   ├── Dockerfile             # Backend container config
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript configuration
│
├── frontend/                   # Staff Dashboard (React)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.tsx  # Main dashboard
│   │   │   ├── QueueManagement.tsx
│   │   │   ├── PatientManagement.tsx
│   │   │   └── RoomManagement.tsx
│   │   ├── services/          # API client services
│   │   ├── test/              # Frontend unit tests
│   │   └── main.tsx           # React entry point
│   ├── cypress/               # E2E tests
│   │   ├── e2e/              # Test specs
│   │   └── support/          # Test utilities
│   ├── Dockerfile            # Frontend container config
│   ├── package.json          # Frontend dependencies
│   └── vite.config.ts        # Vite build configuration
│
├── booking-frontend/          # Patient Booking Portal (React)
│   ├── src/
│   │   ├── components/       # Booking UI components
│   │   └── pages/            # Booking pages
│   ├── Dockerfile
│   └── package.json
│
├── docs/                      # Documentation
│   ├── API.md                # API endpoint documentation
│   ├── DEPLOYMENT.md         # Deployment instructions
│   ├── QUICK_SETUP.md        # Quick start guide
│   ├── USAGE.md              # Usage guide
│   ├── SUMMARY.md            # Project summary
│   ├── SMS_*.md              # SMS integration documentation
│   ├── TESTSPRITE_*.md       # TestSprite testing guides
│   ├── APPOINTMENT_*.md      # Appointment feature docs
│   ├── ENHANCED_*.md         # Enhanced features
│   ├── QUEUE_*.md            # Queue system documentation
│   ├── REALTIME_*.md         # Real-time features
│   ├── testsprite.config.json # TestSprite configuration
│   └── PROJECT_STRUCTURE.md  # This file
│
├── scripts/                   # Utility scripts
│   └── start.sh              # Application startup script
│
├── nginx/                     # Nginx Configuration
│   └── nginx.conf            # Reverse proxy configuration
│
├── logs/                      # Application logs
│   └── *.log                 # Log files (gitignored)
│
├── docker-compose.yml         # Docker orchestration
├── package.json              # Root workspace configuration
├── .gitignore                # Git ignore rules
├── .dockerignore             # Docker ignore rules
├── start                     # Startup wrapper script
└── README.md                 # Main project documentation
```

## Module Organization

### Backend Modules

Each backend module follows NestJS best practices:

```
module-name/
├── module-name.module.ts      # Module definition
├── module-name.controller.ts  # HTTP endpoints
├── module-name.service.ts     # Business logic
├── module-name.service.spec.ts # Unit tests
└── dto/                       # Data Transfer Objects
    ├── create-*.dto.ts
    ├── update-*.dto.ts
    └── index.ts
```

### Frontend Components

Components are organized by feature:

```
components/
├── common/                    # Shared components
├── queue/                     # Queue-related components
├── patients/                  # Patient-related components
└── rooms/                     # Room-related components
```

## Configuration Files

### Root Level
- `docker-compose.yml` - Multi-container orchestration
- `package.json` - Workspace scripts and dependencies
- `.gitignore` - Version control exclusions
- `.dockerignore` - Docker build exclusions

### Backend
- `nest-cli.json` - NestJS CLI configuration
- `tsconfig.json` - TypeScript compiler options
- `jest.config.js` - Jest test configuration
- `prisma/schema.prisma` - Database schema

### Frontend
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.json` - TypeScript compiler options
- `cypress.config.ts` - Cypress E2E test configuration

## Key Technologies

### Backend Stack
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Real-time**: Socket.io WebSockets
- **SMS**: Twilio
- **Testing**: Jest + Supertest

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: React Query
- **Real-time**: Socket.io Client
- **Testing**: Cypress

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: Ready for GitHub Actions

## Development Workflow

1. **Backend Development**: `/backend` - API and business logic
2. **Frontend Development**: `/frontend` - Staff dashboard
3. **Booking Portal**: `/booking-frontend` - Patient interface
4. **Documentation**: `/docs` - Keep docs updated
5. **Scripts**: `/scripts` - Add utility scripts here

## Environment Variables

Environment variables are managed per service:

- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration
- `booking-frontend/.env` - Booking portal configuration

See `.env.example` files in each directory for required variables.

## Testing Structure

```
Testing Layers:
├── Unit Tests          # Jest (backend), React Testing Library (frontend)
├── Integration Tests   # Supertest (API endpoints)
├── E2E Tests          # Cypress (user workflows)
└── Automated Tests    # TestSprite (AI-powered)
```

## Build Artifacts

Build outputs are gitignored:
- `backend/dist/` - Compiled backend code
- `frontend/dist/` - Production frontend bundle
- `booking-frontend/dist/` - Production booking portal bundle
- `node_modules/` - Dependencies
- `logs/` - Application logs

## Documentation Updates

When adding new features:
1. Update relevant `/docs/*.md` files
2. Update API documentation in `/docs/API.md`
3. Update this structure document if adding new directories
4. Keep `README.md` summary current

## Version Control

- Main development branch: `feature/initial-setup`
- All feature branches have been merged
- Use semantic commit messages
- Document breaking changes

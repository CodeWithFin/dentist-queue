# 🦷 Dentist Clinic Queue Management System

A comprehensive full-stack queue management system for dental clinics with real-time updates, priority queuing, and multi-dashboard support.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start backend and frontend
./start.sh

# Or start individually
cd backend && npm run start:dev
cd frontend && npm run dev
```

## 📚 Documentation

All documentation is located in the [`docs/`](./docs/) folder:

- **[README.md](./docs/README.md)** - Full project documentation
- **[QUICK_SETUP.md](./docs/QUICK_SETUP.md)** - Quick setup guide
- **[API.md](./docs/API.md)** - API documentation
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment guide
- **[USAGE.md](./docs/USAGE.md)** - Usage instructions

### Feature Guides

- **[Appointment Booking](./docs/APPOINTMENT_BOOKING_GUIDE.md)** - Self-service booking
- **[SMS Integration](./docs/SMS_INTEGRATION_GUIDE.md)** - Twilio SMS setup
- **[Real-time Wait Times](./docs/REALTIME_WAIT_TIME_GUIDE.md)** - Wait time calculations
- **[TestSprite Testing](./docs/TESTSPRITE_GUIDE.md)** - Automated testing guide

### SMS Documentation

- [SMS Quick Setup](./docs/SMS_QUICK_SETUP.md)
- [SMS Implementation](./docs/SMS_IMPLEMENTATION_COMPLETE.md)
- [Twilio Setup](./docs/TWILIO_SETUP_COMPLETE.md)
- [SMS Testing Results](./docs/SMS_TESTING_RESULTS.md)

### Testing Documentation

- [TestSprite Quick Start](./docs/TESTSPRITE_QUICKSTART.md)
- [TestSprite Step-by-Step](./docs/TESTSPRITE_STEP_BY_STEP.md)
- [Test Report Template](./docs/TEST_REPORT_TEMPLATE.md)

## 🏗️ Project Structure

```
├── backend/          # NestJS backend API
├── frontend/         # React frontend
├── docs/            # All documentation
├── nginx/           # Nginx configuration
└── docker-compose.yml
```

## ✨ Key Features

- ✅ Patient check-in (walk-in or appointment)
- ✅ Priority queue management
- ✅ Real-time position and ETA updates
- ✅ Multi-dashboard support (Patient, Reception, Dentist)
- ✅ Room management
- ✅ SMS notifications
- ✅ Self-service appointment booking
- ✅ Comprehensive testing suite

## 🔧 Tech Stack

- **Backend**: NestJS, PostgreSQL, Redis, WebSocket
- **Frontend**: React, TypeScript, Material UI
- **Testing**: Jest, Cypress, TestSprite
- **Deployment**: Docker, Nginx

## 📖 Full Documentation

See the [docs/](./docs/) folder for complete documentation.

---

For detailed setup, API reference, and usage instructions, please refer to the [documentation folder](./docs/).


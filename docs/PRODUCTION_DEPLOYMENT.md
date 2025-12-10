# Production Deployment Guide - Auto-Seeding Database

## Overview
The backend has been configured to **automatically seed the database** on startup if it's empty. This ensures that in production, the database is always initialized with the necessary data.

## How Auto-Seeding Works

### 1. Automatic Database Seeding
When the backend starts, it checks if the database is empty by counting providers:
- If **no providers exist**, it automatically runs the seed script
- If **providers exist**, it skips seeding (database already initialized)
- Seeding failures are logged but won't prevent the app from starting

### 2. What Gets Seeded
The automatic seeding process creates:
- **Providers (Dentists)**: 2 sample dentists (Dr. Sarah Smith, Dr. Michael Chen)
- **Rooms**: 3 consultation rooms (101, 102, 103)
- **Patients**: 3 test patients (John Doe, Jane Smith, Bob Johnson)
- **Service Types**: All dental service types with durations

## Deployment Steps

### Option 1: Docker Compose (Recommended for Production)

1. **Prepare Environment File**
   ```bash
   cd backend
   cp .env.production.example .env
   ```

2. **Update Production Variables**
   Edit `backend/.env` with your production values:
   ```dotenv
   NODE_ENV=production
   DATABASE_URL=postgresql://dentist:dentist123@postgres:5432/dentist_queue?schema=public
   REDIS_HOST=redis
   REDIS_PORT=6379
   CORS_ORIGIN=http://98.83.39.97,http://98.83.39.97:80
   
   # Update with your Tilil API key
   TILIL_API_KEY=your_production_api_key
   TILIL_SHORTCODE=SISCOM TECH
   ```

3. **Start All Services**
   ```bash
   cd /home/finley/siscom/sidequest/dentist-queue
   docker compose up -d --build
   ```

4. **Verify Deployment**
   ```bash
   # Check backend logs for seeding confirmation
   docker compose logs backend | grep seed
   
   # Should see:
   # ✅ Database already seeded (2 providers found)
   # OR
   # 🌱 Database is empty, running seed...
   # ✅ Auto-seed completed
   ```

### Option 2: Manual Deployment

1. **Set Environment Variables**
   ```bash
   export NODE_ENV=production
   export DATABASE_URL="postgresql://user:pass@host:5432/dentist_queue"
   export REDIS_HOST="your-redis-host"
   ```

2. **Install and Build**
   ```bash
   cd backend
   npm ci --only=production
   npx prisma generate
   npm run build
   ```

3. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start Backend**
   ```bash
   npm run start:prod
   ```
   The backend will automatically check and seed the database on startup.

## Manual Seeding (If Needed)

If you need to manually seed the database:

```bash
cd backend
npm run prisma:seed
```

Or using the seed file directly:
```bash
cd backend
npx ts-node prisma/seed.ts
```

## Production Environment Variables

### Required Variables
```dotenv
# Core Settings
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
REDIS_HOST=redis-host
REDIS_PORT=6379

# CORS (comma-separated)
CORS_ORIGIN=http://98.83.39.97,http://98.83.39.97:80

# SMS Configuration
TILIL_API_KEY=your_api_key
TILIL_SHORTCODE=SISCOM TECH
SMS_ENABLED=true
SMS_CLINIC_NAME=Your Dental Clinic
SMS_CLINIC_PHONE=+1234567890
```

## Troubleshooting

### Database Not Seeding
1. **Check Logs**
   ```bash
   docker compose logs backend | grep -i seed
   ```

2. **Verify Database Connection**
   ```bash
   docker compose exec backend npx prisma db push
   ```

3. **Manual Seed**
   ```bash
   docker compose exec backend npm run prisma:seed
   ```

### Reset Database (Development Only)
```bash
# ⚠️ This will DELETE all data!
docker compose exec backend npx prisma migrate reset
```

## Startup Process Flow

```
Backend Startup
    ↓
Connect to Database
    ↓
Check Provider Count
    ↓
    ├─> Providers Found (> 0)
    │       ↓
    │   Skip Seeding
    │       ↓
    │   ✅ Ready
    │
    └─> No Providers (= 0)
            ↓
        Run Seed Script
            ↓
        Create Providers, Rooms, Patients
            ↓
        ✅ Ready
```

## Health Checks

### Verify Backend is Running
```bash
curl http://98.83.39.97/api/health
```

### Verify Database Seeded
```bash
curl http://98.83.39.97/api/providers
# Should return 2 providers
```

### Check Redis Connection
```bash
docker compose exec redis redis-cli ping
# Should return: PONG
```

## Frontend Configuration

Update frontend environment variables for production:

**frontend/.env**
```dotenv
VITE_API_URL=http://98.83.39.97/api
VITE_WS_URL=http://98.83.39.97
```

**booking-frontend/.env**
```dotenv
VITE_API_URL=http://98.83.39.97/api
```

## Monitoring

### View Logs
```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Filter for errors
docker compose logs backend | grep -i error
```

### Check Service Status
```bash
docker compose ps
```

## Security Notes

1. **Change Default Passwords**: Update PostgreSQL password in production
2. **Use Strong Secrets**: Update all API keys and secrets
3. **Enable HTTPS**: Configure nginx with SSL certificates
4. **Firewall**: Restrict database ports (5432, 6379) to internal network only

## Next Steps

After deployment:
1. ✅ Access staff dashboard: http://98.83.39.97
2. ✅ Access booking portal: http://98.83.39.97/booking
3. ✅ Check API docs: http://98.83.39.97/api/docs
4. 🔐 Update default credentials
5. 📧 Configure production SMS settings
6. 🔒 Set up SSL/HTTPS
7. 📊 Set up monitoring and logging

## Support

For issues or questions, check:
- Backend logs: `docker compose logs backend`
- Database connection: `docker compose exec postgres psql -U dentist -d dentist_queue`
- Redis status: `docker compose exec redis redis-cli info`

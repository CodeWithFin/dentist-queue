# 🚀 Production Deployment Checklist

## Pre-Deployment

- [ ] **Review Changes**
  - [ ] Auto-seeding implemented in `PrismaService`
  - [ ] Dockerfile updated with migration script
  - [ ] CORS configured for production IP
  - [ ] Environment variable template created

- [ ] **Prepare Environment File**
  ```bash
  cd backend
  cp .env.production.example .env
  ```
  
- [ ] **Update Production Variables**
  - [ ] `DATABASE_URL` - Production database URL
  - [ ] `REDIS_HOST` - Production Redis host
  - [ ] `CORS_ORIGIN` - Production domain/IP
  - [ ] `TILIL_API_KEY` - Production SMS API key
  - [ ] `SMS_CLINIC_NAME` - Your clinic name
  - [ ] `SMS_CLINIC_PHONE` - Your clinic phone

## Deployment Steps

### 1. Update Backend Environment
```bash
cd /home/finley/siscom/sidequest/dentist-queue/backend
nano .env
```

Update these critical values:
```dotenv
NODE_ENV=production
DATABASE_URL=postgresql://dentist:dentist123@postgres:5432/dentist_queue?schema=public
REDIS_HOST=redis
REDIS_PORT=6379
CORS_ORIGIN=http://98.83.39.97,http://98.83.39.97:80
TILIL_API_KEY=your_production_key_here
```

### 2. Update Frontend Environment
```bash
cd /home/finley/siscom/sidequest/dentist-queue/frontend
nano .env
```

Update to:
```dotenv
VITE_API_URL=http://98.83.39.97/api
VITE_WS_URL=http://98.83.39.97
```

### 3. Update Booking Frontend Environment
```bash
cd /home/finley/siscom/sidequest/dentist-queue/booking-frontend
nano .env
```

Update to:
```dotenv
VITE_API_URL=http://98.83.39.97/api
```

### 4. Deploy with Docker Compose
```bash
cd /home/finley/siscom/sidequest/dentist-queue
docker compose down
docker compose up -d --build
```

### 5. Monitor Deployment
```bash
# Watch logs
docker compose logs -f

# Or just backend
docker compose logs -f backend
```

Look for these success messages:
```
✅ Database connected
✅ Database already seeded (2 providers found)
  OR
🌱 Database is empty, running seed...
✅ Auto-seed completed
🚀 Application is running on: http://localhost:3000
✅ Redis connected
```

## Post-Deployment Verification

### 1. Check Service Status
```bash
docker compose ps
```

All services should show "Up" status:
- [ ] postgres
- [ ] redis
- [ ] backend
- [ ] frontend
- [ ] booking-frontend
- [ ] nginx

### 2. Verify Backend
```bash
# Health check
curl http://98.83.39.97/api/health

# Check providers (should return 2)
curl http://98.83.39.97/api/providers

# API documentation
curl http://98.83.39.97/api/docs
```

### 3. Verify Database Seeding
```bash
# Check backend logs for seed confirmation
docker compose logs backend | grep -i seed

# Manually check database
docker compose exec postgres psql -U dentist -d dentist_queue -c "SELECT COUNT(*) FROM \"Provider\";"
# Should return: 2 (or more if you added providers)
```

### 4. Verify Redis
```bash
docker compose exec redis redis-cli ping
# Should return: PONG
```

### 5. Test Frontend Access
- [ ] Open http://98.83.39.97 (Staff Dashboard)
- [ ] Open http://98.83.39.97/booking (Booking Portal)
- [ ] Check API docs: http://98.83.39.97/api/docs

### 6. Test Core Functionality
- [ ] **Queue Management**
  - [ ] Can view queue page
  - [ ] Can check-in patient
  - [ ] Can call next patient
  
- [ ] **Providers**
  - [ ] Can view providers list
  - [ ] Should see 2 seeded providers
  
- [ ] **Rooms**
  - [ ] Can view rooms
  - [ ] Should see 3 seeded rooms

- [ ] **WebSocket**
  - [ ] Real-time updates working
  - [ ] Queue updates in real-time

## Troubleshooting

### Database Not Seeding
```bash
# Check logs
docker compose logs backend | grep -i error

# Manually run seed
docker compose exec backend npm run prisma:seed

# Check database connection
docker compose exec backend npx prisma db push
```

### Backend Not Starting
```bash
# Check logs
docker compose logs backend

# Common issues:
# - Database not ready: Wait 10s and check again
# - Migration failed: Check DATABASE_URL
# - Redis not ready: Check REDIS_HOST
```

### Frontend Not Loading
```bash
# Check if nginx is running
docker compose ps nginx

# Check nginx logs
docker compose logs nginx

# Verify environment variables in frontend
docker compose exec frontend env | grep VITE
```

### CORS Errors
```bash
# Update backend CORS_ORIGIN in .env
CORS_ORIGIN=http://98.83.39.97,http://98.83.39.97:80,http://localhost:5173

# Restart backend
docker compose restart backend
```

## Rollback Plan

If deployment fails:

```bash
# 1. Stop services
docker compose down

# 2. Restore previous version
git checkout main  # or previous commit

# 3. Restart with old version
docker compose up -d

# 4. Check logs
docker compose logs -f
```

## Security Checklist (Post-Deployment)

- [ ] Change default PostgreSQL password
- [ ] Update all API keys to production values
- [ ] Set up SSL/HTTPS (configure nginx with certificates)
- [ ] Restrict database ports (5432, 6379) to internal network only
- [ ] Set up firewall rules
- [ ] Enable rate limiting on API
- [ ] Set up monitoring and alerts
- [ ] Configure automated backups for PostgreSQL

## Monitoring Commands

```bash
# Service status
docker compose ps

# All logs
docker compose logs -f

# Specific service logs
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f redis

# Resource usage
docker stats

# Database connection count
docker compose exec postgres psql -U dentist -d dentist_queue -c "SELECT count(*) FROM pg_stat_activity;"

# Redis info
docker compose exec redis redis-cli info
```

## Success Criteria

✅ All services running (`docker compose ps` shows all "Up")
✅ Backend health check returns 200
✅ Database seeded (2+ providers exist)
✅ Frontend accessible on http://98.83.39.97
✅ Booking portal accessible on http://98.83.39.97/booking
✅ API documentation accessible
✅ WebSocket connections working
✅ No errors in logs
✅ Can perform basic operations (check-in, view queue, etc.)

## Next Steps After Deployment

1. **Configure DNS** (if using domain name)
2. **Set up SSL/HTTPS** with Let's Encrypt
3. **Configure monitoring** (Prometheus, Grafana, etc.)
4. **Set up automated backups**
5. **Configure log aggregation** (ELK stack, CloudWatch, etc.)
6. **Set up CI/CD pipeline**
7. **Create backup/restore procedures**
8. **Document operational procedures**

## Support

For issues, check:
- 📚 **AUTO_SEEDING_SUMMARY.md** - Auto-seeding details
- 📚 **PRODUCTION_DEPLOYMENT.md** - Full deployment guide
- 📚 **DEPLOYMENT.md** - General deployment info
- 📚 **USAGE.md** - User guide

## Quick Reference Commands

```bash
# Full redeploy
docker compose down && docker compose up -d --build

# Restart specific service
docker compose restart backend

# View logs with timestamps
docker compose logs -f --timestamps backend

# Follow logs for all services
docker compose logs -f

# Shell into backend
docker compose exec backend sh

# Database shell
docker compose exec postgres psql -U dentist -d dentist_queue

# Redis shell
docker compose exec redis redis-cli
```

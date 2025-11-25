# Deployment Guide

## Table of Contents
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)

## Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

### Step-by-Step Setup

#### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd dentist-queue-management-system
npm run install:all
```

#### 2. Start Infrastructure Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis
```

Wait for services to be healthy:
```bash
docker-compose ps
```

#### 3. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://dentist:dentist123@localhost:5432/dentist_queue?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:5173
AVERAGE_CONSULTATION_TIME=20
```

#### 4. Run Database Migrations

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

Optional: Seed the database
```bash
npx prisma db seed  # If seed script is implemented
```

#### 5. Configure Frontend Environment

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

#### 6. Start Development Servers

From the root directory:
```bash
npm run dev
```

Or start individually:
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### 7. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- API Documentation: http://localhost:3000/api/docs

## Production Deployment

### Docker Compose Deployment

#### 1. Build and Start All Services

```bash
docker-compose up -d --build
```

This will start:
- PostgreSQL database
- Redis cache
- Backend API
- Frontend app
- Nginx reverse proxy

#### 2. Verify Services

```bash
docker-compose ps
docker-compose logs -f
```

#### 3. Run Migrations

```bash
docker-compose exec backend npx prisma migrate deploy
```

#### 4. Access the Application

- Application: http://localhost
- API: http://localhost/api
- WebSocket: ws://localhost/socket.io

### Manual Production Deployment

#### Backend Deployment

1. Build the application:
```bash
cd backend
npm ci
npx prisma generate
npm run build
```

2. Set environment variables:
```bash
export NODE_ENV=production
export PORT=3000
export DATABASE_URL="your_production_db_url"
export REDIS_HOST="your_redis_host"
export CORS_ORIGIN="https://yourdomain.com"
```

3. Run migrations:
```bash
npx prisma migrate deploy
```

4. Start the application:
```bash
npm run start:prod
```

#### Frontend Deployment

1. Build the application:
```bash
cd frontend
npm ci
npm run build
```

2. Serve with Nginx:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
    }

    location /socket.io {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `3000` | No |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `REDIS_HOST` | Redis hostname | `localhost` | Yes |
| `REDIS_PORT` | Redis port | `6379` | Yes |
| `REDIS_PASSWORD` | Redis password | - | No |
| `CORS_ORIGIN` | Allowed CORS origins | - | Yes |
| `AVERAGE_CONSULTATION_TIME` | Avg consultation time (minutes) | `20` | No |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` | Yes |
| `VITE_WS_URL` | WebSocket URL | `http://localhost:3000` | Yes |

## Database Setup

### Prisma Migrations

Create a new migration:
```bash
cd backend
npx prisma migrate dev --name <migration_name>
```

Apply migrations in production:
```bash
npx prisma migrate deploy
```

Reset database (development only):
```bash
npx prisma migrate reset
```

View database:
```bash
npx prisma studio
```

### Database Backup

PostgreSQL backup:
```bash
docker-compose exec postgres pg_dump -U dentist dentist_queue > backup.sql
```

Restore:
```bash
docker-compose exec -T postgres psql -U dentist dentist_queue < backup.sql
```

## Monitoring & Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Health Checks

Backend health:
```bash
curl http://localhost:3000/api/health
```

Frontend health:
```bash
curl http://localhost/health
```

## Scaling

### Horizontal Scaling

For production environments, you can scale the backend:

```bash
docker-compose up -d --scale backend=3
```

Add load balancing in nginx.conf:
```nginx
upstream backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}
```

## SSL/TLS Configuration

For production, use Let's Encrypt with Certbot:

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Verify connection string
echo $DATABASE_URL
```

#### 2. Redis Connection Failed

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli ping
```

#### 3. WebSocket Connection Failed

Check CORS settings in backend `.env`:
```env
CORS_ORIGIN=http://localhost:5173
```

Verify WebSocket endpoint is accessible:
```javascript
// Browser console
const socket = io('http://localhost:3000/queue');
socket.on('connect', () => console.log('Connected!'));
```

#### 4. Build Failures

Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 5. Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Performance Optimization

#### Backend

1. Enable Redis caching for frequently accessed data
2. Add database indexes for common queries
3. Use connection pooling for PostgreSQL
4. Enable gzip compression

#### Frontend

1. Code splitting with lazy loading
2. Image optimization
3. CDN for static assets
4. Browser caching

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Database**: Use strong passwords and restrict access
3. **API**: Implement rate limiting
4. **HTTPS**: Always use SSL in production
5. **Dependencies**: Regularly update packages
6. **Secrets**: Use a secrets manager (e.g., AWS Secrets Manager)

## Maintenance

### Regular Tasks

1. Monitor disk space
2. Review logs for errors
3. Update dependencies monthly
4. Backup database weekly
5. Test disaster recovery procedures

### Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Run tests after updates
npm test
```

## Support

For issues and questions:
- GitHub Issues: <repository-url>/issues
- Documentation: <repository-url>/wiki
- Email: support@example.com


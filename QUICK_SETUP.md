# 🚀 Quick Database Setup

## Run These 3 Commands in Your Terminal

### Step 1: Set up PostgreSQL Database (requires password)
```bash
sudo -u postgres psql -f /tmp/setup_db.sql
```

### Step 2: Run Database Migrations
```bash
cd /home/finley/siscom/sidequest/dentist-queue-management-system/backend
npx prisma migrate dev --name init
```

### Step 3: Verify Backend is Running
```bash
# Check the backend log
tail -f /home/finley/siscom/sidequest/dentist-queue-management-system/backend.log
```

---

## ✅ Expected Output

After Step 1, you should see:
```
CREATE ROLE
CREATE DATABASE
GRANT
```

After Step 2, you should see:
```
✔ Generated Prisma Client
✔ Your database is now in sync with your schema.
```

---

## 🌐 Access Your Application

Once complete, open these URLs:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/health
- **API Docs**: http://localhost:3000/api/docs

---

## 🔍 Troubleshooting

### If database creation fails:
```bash
# Check if database already exists
sudo -u postgres psql -c "\l" | grep dentist_queue

# If it exists, just run migrations (Step 2)
```

### If migrations fail:
```bash
# Check backend .env file
cat backend/.env

# DATABASE_URL should be:
# postgresql://dentist:dentist123@localhost:5432/dentist_queue?schema=public
```

### Check Services:
```bash
# PostgreSQL
sudo systemctl status postgresql

# Redis
ps aux | grep redis

# Frontend
lsof -i :5173

# Backend logs
tail -20 backend.log
```

---

## 🎉 Success Checklist

- [ ] Step 1 completed (database created)
- [ ] Step 2 completed (migrations ran)
- [ ] Backend log shows "Application is running"
- [ ] Frontend accessible at http://localhost:5173
- [ ] API health check returns: {"status":"ok"}

---

**Need help?** Check the logs:
```bash
# Backend
tail -f backend.log

# Frontend  
tail -f frontend.log
```


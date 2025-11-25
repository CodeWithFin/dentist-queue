#!/bin/bash

# Dentist Queue Management System - Quick Start Script
# This script helps you get the system up and running quickly

set -e

echo "🦷 Dentist Queue Management System - Quick Start"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Ask user for deployment mode
echo "Select deployment mode:"
echo "1) Development (with hot reload)"
echo "2) Production (Docker containers)"
echo ""
read -p "Enter your choice (1 or 2): " mode

if [ "$mode" == "1" ]; then
    echo ""
    echo "🚀 Starting in Development Mode..."
    echo ""
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Node.js is installed${NC}"
    
    # Start infrastructure services
    echo ""
    echo "📦 Starting PostgreSQL and Redis..."
    docker-compose up -d postgres redis
    
    # Wait for services to be ready
    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    if ! docker-compose ps | grep -q "postgres.*Up"; then
        echo -e "${RED}❌ PostgreSQL failed to start${NC}"
        docker-compose logs postgres
        exit 1
    fi
    
    if ! docker-compose ps | grep -q "redis.*Up"; then
        echo -e "${RED}❌ Redis failed to start${NC}"
        docker-compose logs redis
        exit 1
    fi
    
    echo -e "${GREEN}✅ Infrastructure services are running${NC}"
    
    # Install dependencies
    echo ""
    echo "📦 Installing dependencies..."
    
    # Backend
    if [ ! -d "backend/node_modules" ]; then
        echo "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
    fi
    
    # Frontend
    if [ ! -d "frontend/node_modules" ]; then
        echo "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi
    
    # Setup environment files
    echo ""
    echo "⚙️  Setting up environment files..."
    
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env 2>/dev/null || echo "DATABASE_URL=postgresql://dentist:dentist123@localhost:5432/dentist_queue?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
AVERAGE_CONSULTATION_TIME=20" > backend/.env
        echo -e "${GREEN}✅ Backend .env created${NC}"
    fi
    
    if [ ! -f "frontend/.env" ]; then
        echo "VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000" > frontend/.env
        echo -e "${GREEN}✅ Frontend .env created${NC}"
    fi
    
    # Run database migrations
    echo ""
    echo "🗃️  Running database migrations..."
    cd backend
    npx prisma generate
    npx prisma migrate deploy || npx prisma migrate dev --name init
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo ""
    echo "Starting development servers..."
    echo ""
    echo "📍 Access points:"
    echo "   - Frontend: http://localhost:5173"
    echo "   - Backend API: http://localhost:3000/api"
    echo "   - API Docs: http://localhost:3000/api/docs"
    echo ""
    echo "To start the servers, run:"
    echo "   Terminal 1: cd backend && npm run start:dev"
    echo "   Terminal 2: cd frontend && npm run dev"
    echo ""
    echo "Or run both at once:"
    echo "   npm run dev"
    
elif [ "$mode" == "2" ]; then
    echo ""
    echo "🚀 Starting in Production Mode..."
    echo ""
    
    # Build and start all services
    echo "📦 Building and starting all services..."
    docker-compose up -d --build
    
    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 15
    
    # Check if services are running
    echo ""
    echo "🔍 Checking services..."
    
    if docker-compose ps | grep -q "postgres.*Up"; then
        echo -e "${GREEN}✅ PostgreSQL is running${NC}"
    else
        echo -e "${RED}❌ PostgreSQL is not running${NC}"
    fi
    
    if docker-compose ps | grep -q "redis.*Up"; then
        echo -e "${GREEN}✅ Redis is running${NC}"
    else
        echo -e "${RED}❌ Redis is not running${NC}"
    fi
    
    if docker-compose ps | grep -q "backend.*Up"; then
        echo -e "${GREEN}✅ Backend is running${NC}"
    else
        echo -e "${RED}❌ Backend is not running${NC}"
    fi
    
    if docker-compose ps | grep -q "frontend.*Up"; then
        echo -e "${GREEN}✅ Frontend is running${NC}"
    else
        echo -e "${RED}❌ Frontend is not running${NC}"
    fi
    
    # Run migrations
    echo ""
    echo "🗃️  Running database migrations..."
    docker-compose exec backend npx prisma migrate deploy
    
    echo ""
    echo -e "${GREEN}✅ All services are running!${NC}"
    echo ""
    echo "📍 Access points:"
    echo "   - Application: http://localhost"
    echo "   - API: http://localhost/api"
    echo "   - API Docs: http://localhost/api/docs"
    echo ""
    echo "To view logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "To stop services:"
    echo "   docker-compose down"
    
else
    echo -e "${RED}Invalid choice. Exiting.${NC}"
    exit 1
fi

echo ""
echo "================================================"
echo -e "${GREEN}🎉 Setup complete! Enjoy using the system!${NC}"
echo "================================================"
echo ""
echo "📚 Documentation:"
echo "   - User Guide: USAGE.md"
echo "   - Deployment: DEPLOYMENT.md"
echo "   - API Reference: API.md"
echo "   - System Overview: SUMMARY.md"
echo ""


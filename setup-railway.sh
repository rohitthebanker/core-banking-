#!/bin/bash

# CoreBank Automated Railway Setup
# This script automatically prepares your project for Railway deployment

set -e

echo "🚀 CoreBank Automated Railway Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git found${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm found${NC}"

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
npm install

# Create and setup frontend if it doesn't exist
if [ ! -d "frontend" ]; then
    echo "Creating React frontend..."
    npx create-react-app frontend
    cd frontend
    npm install axios
    cd ..
    echo -e "${GREEN}✅ React frontend created${NC}"
else
    echo -e "${YELLOW}⚠️ Frontend directory already exists${NC}"
fi

echo ""
echo "📝 Setting up configuration files..."

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
fi

# Check if frontend has CoreBank.jsx
if [ ! -f "frontend/src/CoreBank.jsx" ]; then
    echo -e "${YELLOW}⚠️ CoreBank.jsx not found in frontend/src/${NC}"
    echo "Please copy CoreBank.jsx to frontend/src/"
else
    echo -e "${GREEN}✅ CoreBank.jsx found${NC}"
fi

# Check if App.js has been updated
if ! grep -q "CoreBank" "frontend/src/App.js"; then
    echo -e "${YELLOW}⚠️ App.js doesn't import CoreBank yet${NC}"
    echo "Creating updated App.js..."
    cat > frontend/src/App.js << 'EOF'
import CoreBank from './CoreBank';
import './App.css';

function App() {
  return <CoreBank />;
}

export default App;
EOF
    echo -e "${GREEN}✅ Updated App.js${NC}"
else
    echo -e "${GREEN}✅ App.js already configured${NC}"
fi

# Build frontend
echo ""
echo "🔨 Building React frontend..."
cd frontend
npm run build
cd ..
echo -e "${GREEN}✅ Frontend built successfully${NC}"

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo ""
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "CoreBank - Ready for Railway deployment"
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${YELLOW}⚠️ Git repository already initialized${NC}"
fi

echo ""
echo -e "${GREEN}========== Setup Complete! ==========${NC}"
echo ""
echo "📚 Next steps:"
echo ""
echo "1️⃣  Create a GitHub repository:"
echo "    - Go to https://github.com/new"
echo "    - Name it: corebank"
echo "    - Copy the commands below"
echo ""
echo "2️⃣  Push to GitHub (replace YOUR_USERNAME):"
echo "    git remote add origin https://github.com/YOUR_USERNAME/corebank.git"
echo "    git branch -M main"
echo "    git push -u origin main"
echo ""
echo "3️⃣  Deploy to Railway:"
echo "    - Go to https://railway.app"
echo "    - Click 'New Project'"
echo "    - Select 'Deploy from GitHub repo'"
echo "    - Connect your GitHub account"
echo "    - Select the corebank repository"
echo "    - Click 'Deploy'"
echo ""
echo "4️⃣  Get your live URL:"
echo "    - Open your Railway dashboard"
echo "    - Click your service"
echo "    - Go to Settings → Domains"
echo "    - Copy the auto-generated URL"
echo "    - Open it in your browser!"
echo ""
echo "📖 For detailed help, read DEPLOY-QUICK-START.md"
echo ""

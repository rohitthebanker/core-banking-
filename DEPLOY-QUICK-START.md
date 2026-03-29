# 🚀 CoreBank Railway Deployment - Quick Start

Get your CoreBank live in production in 5 minutes!

## What You Need

1. GitHub account (free at github.com)
2. Railway account (free at railway.app)
3. Your custom domain (optional)
4. 10 minutes of time

## The 6-Step Process

### STEP 1: Prepare Your Code (2 minutes)

```bash
# 1. Make sure you have the right files
ls -la server-production.js package.json railway.json

# 2. Create React frontend
npx create-react-app frontend

# 3. Copy CoreBank.jsx to frontend/src/
cp CoreBank.jsx frontend/src/CoreBank.jsx

# 4. Update frontend/src/App.js
# Replace entire file with:
"""
import CoreBank from './CoreBank';
function App() { return <CoreBank />; }
export default App;
"""

# 5. Update CoreBank.jsx API_URL
# Change: const API_URL = 'http://localhost:5000/api';
# To:     const API_URL = '/api';

# 6. Install dependencies
npm install
cd frontend && npm install && cd ..
```

### STEP 2: Test Locally (1 minute)

```bash
# Build frontend
cd frontend && npm run build && cd ..

# Start server
npm start

# Visit http://localhost:5000 in browser
# Should see CoreBank interface
```

### STEP 3: Push to GitHub (2 minutes)

```bash
# Initialize Git
git init
git add .
git commit -m "CoreBank - Ready for production"

# Create repo on github.com/new
# Name it: corebank
# Copy commands below, replacing YOUR_USERNAME

git remote add origin https://github.com/YOUR_USERNAME/corebank.git
git branch -M main
git push -u origin main
```

### STEP 4: Deploy to Railway (1 minute)

1. Go to https://railway.app
2. Sign in (or create free account)
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Click "Configure GitHub App"
6. Authorize and select `corebank` repo
7. Click "Deploy"

✅ **Railway is now building and deploying your app!**

### STEP 5: Get Your Live URL (30 seconds)

1. Wait for deployment to complete (green checkmark)
2. Click your service
3. Go to "Settings" → "Domains"
4. Copy the auto-generated URL
5. Open in browser - your app is LIVE! 🎉

Example: `https://corebank-production.railway.app`

### STEP 6: Setup Custom Domain (Optional - 5 minutes)

If you have a domain (banking.yoursite.com):

**In Railway Dashboard:**
1. Click "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your domain: `banking.yoursite.com`
4. Copy the CNAME value

**In Your Domain Registrar (GoDaddy, Namecheap, etc.):**
1. Go to DNS settings
2. Add CNAME record:
   - Name: `banking`
   - Value: Railway's CNAME value
3. Save changes

✅ **Wait 1-48 hours for DNS to update**

---

## Testing Your Live App

### Test API Endpoints
```bash
# Replace with your Railway URL
RAILWAY_URL="https://corebank-production.railway.app"

# Get customers
curl $RAILWAY_URL/api/customers

# Create customer
curl -X POST $RAILWAY_URL/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "phone":"555-0123"
  }'
```

### Test Frontend
Open in browser: `https://YOUR_RAILWAY_URL.railway.app`

---

## Making Updates

After deployment, every time you make changes:

```bash
# Make your changes, then:
git add .
git commit -m "Feature: Added new feature"
git push origin main

# Railway automatically redeploys! 🚀
# Watch deployment in Railway dashboard
```

---

## Troubleshooting

### Build fails?
1. Check Railway logs (Deploy tab)
2. Ensure `npm run build:frontend` works locally
3. Verify package.json scripts are correct

### App won't start?
1. Check Railway logs for errors
2. Test locally: `npm start`
3. Check database path is correct

### Custom domain not working?
1. Verify CNAME record in DNS settings
2. Wait 24 hours for DNS propagation
3. Test with nslookup: `nslookup banking.yoursite.com`

### Need help?
- Railway docs: https://docs.railway.app
- Check logs in Railway dashboard
- Try deploying with Railway URL first before custom domain

---

## You're Done! 🎉

Your CoreBank is now live! Share your URL with users and start processing banking operations.

### What's Included?
✅ Full banking system with SQLite database
✅ Customer management
✅ Multiple account types
✅ Deposits, withdrawals, transfers
✅ Compound interest calculations
✅ Transaction history
✅ Auto-scaling backend
✅ Custom domain support

### Next Steps?
- Add user authentication
- Set up automated backups
- Monitor performance in Railway dashboard
- Scale to PostgreSQL when you grow
- Add more features (loans, investments, etc.)

---

**Questions?** Read the full guide: `RAILWAY-DEPLOYMENT.md`

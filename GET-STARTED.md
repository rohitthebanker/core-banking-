# 🚀 CoreBank Production Deployment Master Guide

**Get your banking app live in production with Railway and your custom domain**

---

## ⏱️ Time Required: 15 minutes

This guide will take you from local development to live production with a custom domain.

---

## 📋 What You'll Get

✅ Backend running on Railway  
✅ Frontend served from same domain  
✅ Your custom domain pointing to your app  
✅ Zero downtime deployments  
✅ Automatic scaling  

---

## 🎯 Prerequisites

Before starting, make sure you have:

1. **Node.js** installed (v14+) - [Download](https://nodejs.org)
2. **Git** installed - [Download](https://git-scm.com)
3. **GitHub account** (free) - [Create](https://github.com/signup)
4. **Railway account** (free) - [Create](https://railway.app)
5. **Your custom domain** - You own the domain (e.g., banking.example.com)

---

## 🗂️ Files You Received

The deployment package includes:

**Backend Files:**
- `server-production.js` - Production server (serves both API and frontend)
- `package.json` - Dependencies and build scripts
- `railway.json` - Railway deployment config

**Configuration:**
- `.env.example` - Environment variables template
- `.gitignore` - Protect secrets
- `Procfile` - Process configuration

**Automation Scripts:**
- `setup-railway.sh` - One-click automated setup ⭐ START HERE
- `prepare-deployment.sh` - Manual setup guide

**Documentation:**
- `DEPLOY-QUICK-START.md` - Quick 6-step guide
- `RAILWAY-DEPLOYMENT.md` - Comprehensive guide
- `PRODUCTION-CHECKLIST.md` - File reference guide

---

## 🏃 Fast Track (5 steps, 10 minutes)

### Step 1: Automated Setup
```bash
cd corebank-backend
chmod +x setup-railway.sh
./setup-railway.sh
```

This script automatically:
- ✅ Creates React frontend
- ✅ Builds production code
- ✅ Initializes Git repository

### Step 2: GitHub Push
```bash
# Create repo on github.com/new and name it "corebank"
# Then run:

git remote add origin https://github.com/YOUR_USERNAME/corebank.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Connect to Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Click "Configure GitHub App" 
5. Authorize Railway
6. Select `corebank` repository
7. Click "Deploy"

⏳ **Wait for deployment to complete** (2-5 minutes)

You'll see green checkmarks when ready.

### Step 4: Get Your Railway URL
1. Click your service in Railway dashboard
2. Go to "Settings" → "Domains"
3. Copy the auto-generated URL
4. Open it in browser - **Your app is LIVE!** 🎉

Example: `https://corebank-production.railway.app`

### Step 5: Setup Custom Domain (if you have one)

**In Railway:**
1. Go to "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your domain: `banking.example.com`
4. Railway shows you a CNAME value

**In Your Domain Registrar (GoDaddy, Namecheap, etc.):**
1. Go to DNS/Domain settings
2. Find DNS Records or Advanced settings
3. Add CNAME Record:
   - **Name:** `banking` (or whatever subdomain you want)
   - **Value:** Railway's CNAME value (copy from Railway)
   - **TTL:** 3600
4. Save changes

⏳ **Wait 1-48 hours for DNS to propagate**

Then test: `https://banking.example.com`

---

## 🧪 Testing Your Deployment

### Test API
```bash
# Replace with your Railway URL
curl https://YOUR_RAILWAY_URL/api/customers
```

### Test Frontend
Open in browser:
```
https://YOUR_RAILWAY_URL
```

Should see CoreBank dashboard!

### Create Test Data
1. In CoreBank interface, click "Settings"
2. Add a customer
3. Select customer and add account
4. Make deposits/transfers
5. Watch data persist

---

## 📝 Making Updates

After deployment, updates are automatic:

```bash
# Make your code changes
# Then:

git add .
git commit -m "Feature: Your change description"
git push origin main

# Railway automatically:
# 1. Detects the push
# 2. Rebuilds your app
# 3. Redeploys (zero downtime)
# Watch in Railway dashboard
```

---

## ❓ Troubleshooting

### "Build failed"
1. Check Railway logs (Deploy tab)
2. Ensure `npm run build:frontend` works locally
3. Verify all files are in repository

### "App won't start"  
1. Check Railway logs for error messages
2. Test locally: `npm start`
3. Verify database path is correct

### "API returns 404"
1. In CoreBank.jsx, API_URL should be `/api` (not localhost)
2. Check that routes in server-production.js are correct
3. Check Railway logs

### "Custom domain not working"
1. Verify CNAME record in DNS settings
2. Wait 24 hours for DNS propagation
3. Test with: `nslookup banking.example.com`
4. If still not working, re-check DNS configuration

---

## 📊 Monitoring Your App

In Railway Dashboard:

- **Metrics**: CPU, memory, disk usage
- **Logs**: Real-time app logs
- **Deploy history**: All deployments
- **Environment variables**: Configuration
- **Domains**: Your URLs

---

## 🔒 Security Best Practices

✅ **Do:**
- Keep `.env` file locally only (never in Git)
- Use strong database passwords if needed
- Enable HTTPS (Railway does this automatically)
- Regular backups of database
- Monitor Railway logs for errors

❌ **Don't:**
- Commit `.env` file to GitHub
- Share Railway tokens
- Hardcode secrets in code
- Ignore production errors

---

## 🚀 Production Optimization

### For Better Performance:
1. **Enable production mode** - Set `NODE_ENV=production` in Railway
2. **Use PostgreSQL** - When you outgrow SQLite (Railway has built-in PostgreSQL)
3. **Add caching** - Redis for frequently accessed data
4. **Monitor performance** - Use Railway analytics

### When You Scale:
- CPU and memory scale automatically
- Database can be upgraded to PostgreSQL
- Add Redis cache if needed
- Consider CDN for static assets

---

## 📞 Getting Help

### If Something Goes Wrong:

1. **Check Railway logs**
   - Most useful debugging info
   - Shows exact error messages

2. **Check browser console**
   - Press F12 in browser
   - Look for error messages in Console tab

3. **Test locally first**
   - Run `npm start`
   - Test API and frontend locally
   - If it fails locally, fix before redeploying

4. **Read documentation**
   - `DEPLOY-QUICK-START.md` - Quick reference
   - `RAILWAY-DEPLOYMENT.md` - Detailed guide
   - `PRODUCTION-CHECKLIST.md` - File reference

5. **Railway support**
   - https://railway.app/support
   - Helpful docs and community

---

## ✅ Deployment Checklist

- [ ] Prerequisites installed (Node.js, Git)
- [ ] GitHub account created
- [ ] Railway account created
- [ ] Ran setup-railway.sh
- [ ] GitHub repository created and pushed
- [ ] Railway deployment completed
- [ ] Got Railway URL working
- [ ] API endpoints responding
- [ ] Frontend loads in browser
- [ ] Custom domain DNS configured (if applicable)
- [ ] Tested creating customer and account
- [ ] Made a test transaction
- [ ] Monitored Railway dashboard

---

## 🎓 What's Next?

After you're live:

### Short Term:
- [ ] Monitor app performance
- [ ] Make sure backups are working
- [ ] Share your URL with users
- [ ] Gather feedback

### Medium Term:
- [ ] Add user authentication
- [ ] Implement more account types
- [ ] Add loan management
- [ ] Create admin dashboard

### Long Term:
- [ ] Scale to PostgreSQL
- [ ] Add mobile app
- [ ] Implement API documentation
- [ ] Add automated testing
- [ ] Consider compliance requirements

---

## 📚 Important Files Reference

| File | Purpose | When Needed |
|------|---------|-------------|
| `setup-railway.sh` | Automated setup | **First** - run this! |
| `DEPLOY-QUICK-START.md` | Quick guide | Follow for 6-step deployment |
| `server-production.js` | Backend API | Understand how it works |
| `frontend/src/CoreBank.jsx` | User interface | Customize UI |
| `railway.json` | Deployment config | Railway reads this |
| `package.json` | Dependencies | Change if adding packages |

---

## 🎉 You're Ready!

Your CoreBank is about to go live!

### Quick Action Plan:
1. ✅ Run `./setup-railway.sh`
2. ✅ Push to GitHub
3. ✅ Connect to Railway
4. ✅ Get your URL
5. ✅ Setup custom domain
6. ✅ Test everything
7. ✅ **You're live!** 🚀

---

## 💡 Pro Tips

- **Test locally before pushing** - Catch errors early
- **Keep Git history clean** - Makes debugging easier
- **Monitor Rails dashboard regularly** - Catch issues early
- **Backup your database** - Even with Railway, have backups
- **Document changes** - Write good commit messages
- **Automate everything** - Use scripts for repetitive tasks

---

## 📞 Questions?

- Read: `DEPLOY-QUICK-START.md` (6-step guide)
- Deep dive: `RAILWAY-DEPLOYMENT.md` (comprehensive)
- Reference: `PRODUCTION-CHECKLIST.md` (all files explained)

---

## 🚀 Let's Go!

You have everything you need. The world is waiting for your CoreBank!

**Next step:** Run `./setup-railway.sh`

Good luck! 🎉

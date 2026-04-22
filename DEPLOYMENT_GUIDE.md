# FitTrack Cloud Deployment Guide

Complete guide to deploy FitTrack to production using **Vercel** (frontend), **Railway** (backend), and **MongoDB Atlas** (database).

---

## 📋 Overview

This guide walks through deploying FitTrack to a production cloud environment. The deployment stack consists of:

| Component | Platform | Tier | Cost |
|-----------|----------|------|------|
| Frontend | [Vercel](https://vercel.com) | Free | $0/month |
| Backend | [Railway](https://railway.app) | Pay-as-you-go | ~$5-10/month |
| Database | [MongoDB Atlas](https://mongodb.com/cloud/atlas) | M0 Sandbox | $0/month |

**Total estimated cost: $5-10/month** for a production-ready application.

---

## ✅ Prerequisites

Before starting, ensure you have:
- [ ] GitHub account with the FitTrack repository pushed
- [ ] Node.js installed locally (for testing)
- [ ] Git installed and configured
- [ ] Access to email (for account creation)

---

## Phase 1: MongoDB Atlas Setup (Cloud Database)

MongoDB Atlas provides a free M0 Sandbox tier perfect for starting out.

### Step 1.1: Create MongoDB Atlas Account

1. Go to **[mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)**
2. Click **Sign Up** (or **Sign In** if you have an account)
3. Sign up using:
   - Email + password, OR
   - Google OAuth (recommended for faster setup)

### Step 1.2: Create a Project

1. After signing in, click **Create Project**
2. Enter project name: `FitTrack`
3. Click **Next**
4. Click **Create Project**

### Step 1.3: Create a Cluster

1. Click **Build a Database** or **+ Create**
2. Choose **M0 Sandbox** (free tier)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. **Select Region**: Choose the region closest to your expected users
   - Example: `us-east-1` for North America, `eu-west-1` for Europe
5. Cluster name: `fittrack-prod`
6. Click **Create Deployment**

**Wait 5-10 minutes for cluster to deploy...**

### Step 1.4: Create Database User (Credentials)

1. In the MongoDB Atlas dashboard, go to **Security > Database Access**
2. Click **+ Add Database User**
3. Fill in credentials:
   - **Username**: `fittrack_user`
   - **Password**: Click **Auto-generate password** (save it in a secure place)
   - **Built-in Role**: Select **Read and write to any database**
4. Click **Add User**

**⚠️ Save these credentials!** You'll need them for Railway configuration.

### Step 1.5: Configure Network Access

1. Go to **Security > Network Access**
2. Click **+ Add IP Address**
3. Add your current IP address:
   - For testing locally: Click **Add Current IP Address**
   - For Railway deployment: Add `0.0.0.0/0` (allows all IPs)
4. Click **Confirm**

### Step 1.6: Get MongoDB Connection String

1. Go to **Deployment > Clusters**
2. Click **Connect** on your cluster
3. Choose **Drivers**
4. Copy the connection string:
   ```
   mongodb+srv://fittrack_user:<PASSWORD>@cluster.mongodb.net/fittrack?retryWrites=true&w=majority
   ```
5. Replace `<PASSWORD>` with your actual password from Step 1.4

**Example:**
```
mongodb+srv://fittrack_user:MySecure123Pass@fittrack-prod.mongodb.net/fittrack?retryWrites=true&w=majority
```

**📌 Save this connection string** - you'll need it for Railway!

---

## Phase 2: Deploy Backend to Railway

Railway provides simple deployment for Node.js apps with automatic deployments on Git push.

### Step 2.1: Create Railway Account

1. Go to **[railway.app](https://railway.app)**
2. Click **Sign Up**
3. Choose **Sign up with GitHub** (recommended)
4. Authorize Railway to access your GitHub account

### Step 2.2: Create a New Project

1. In Railway dashboard, click **+ New Project**
2. Select **Empty Project**

### Step 2.3: Add GitHub Repository Service

1. Click **+ New** button in the project
2. Select **GitHub Repo**
3. Click **Connect GitHub Account** (if not already connected)
4. Select your `fittrack-react` repository
5. Choose production branch: `main`
6. Click **Deploy**

### Step 2.4: Configure Build Settings

1. In the Railway dashboard, click on your service card
2. Go to the **Settings** tab
3. Configure:
   - **Root Directory**: `./backend`
   - **Build Command**: `npm install && npm run build` (or leave default)
   - **Start Command**: `npm start`

### Step 2.5: Set Environment Variables

1. In Railway dashboard, click on your service
2. Go to **Variables** tab
3. Add the following environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `MONGO_URI` | `mongodb+srv://fittrack_user:PASSWORD@cluster.mongodb.net/fittrack?retryWrites=true&w=majority` | Your MongoDB Atlas connection string from Phase 1 |
| `JWT_SECRET` | Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | 32-character random string for token signing |
| `PORT` | `5000` | Default port |
| `NODE_ENV` | `production` | Tells Node this is production |

**How to generate JWT_SECRET:**

Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

It will output something like:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Copy this value and paste it into the `JWT_SECRET` variable in Railway.

### Step 2.6: Verify Deployment

1. Watch the Railway dashboard for deployment status
2. You should see **Deployment Successful** (takes 2-3 minutes)
3. In your service settings, note the **Domain** URL:
   - Format: `https://fittrack-backend.up.railway.app`
   - Format: `https://fittrack-backend-production.up.railway.app`

**Test the backend is working:**
```bash
curl https://fittrack-backend.up.railway.app/
```

Should return:
```json
{
  "message": "🏋️ FitTrack API is running!",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

**📌 Save your Railway backend URL** - you'll need it for Vercel!

---

## Phase 3: Deploy Frontend to Vercel

Vercel is optimized for deploying React/Vite apps with one-click deployment from GitHub.

### Step 3.1: Create Vercel Account

1. Go to **[vercel.com](https://vercel.com)**
2. Click **Sign Up**
3. Choose **Sign up with GitHub** (recommended)
4. Authorize Vercel to access your GitHub repositories

### Step 3.2: Import Your Repository

1. In Vercel dashboard, click **+ New Project** or **Add New...**
2. Select **Import Git Repository**
3. Paste your repository URL: `https://github.com/YOUR_USERNAME/fittrack-react`
   - Or connect GitHub and select the repo from the list
4. Click **Import**

### Step 3.3: Configure Project Settings

Vercel should auto-detect these, but verify:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `./` (root) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 3.4: Set Environment Variables

1. In Vercel project settings, go to **Environment Variables**
2. Add this variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://fittrack-backend.up.railway.app/api` |

**Replace** `fittrack-backend.up.railway.app` with your actual Railway backend domain from Phase 2.6.

**⚠️ Important:** The URL must end with `/api` (notice the `/api` at the end)

### Step 3.5: Deploy

1. Click **Deploy** button
2. Wait for build to complete (takes 2-5 minutes)
3. You'll see **Congratulations! Your project has been successfully deployed**
4. Your frontend URL: `https://fittrack.vercel.app` (or custom domain)

**Test the frontend:**
- Visit your Vercel URL in the browser
- Page should load
- No CORS errors in browser console
- Try signing up

---

## ✅ Verification Checklist

### Frontend (Vercel URL) ✓

Run through these tests on your deployed frontend:

- [ ] **Page loads** - No errors in browser console
- [ ] **Styling loaded** - Colors, fonts, layout look correct
- [ ] **Signup works** - Create new account with email
- [ ] **Login works** - Login with created credentials
- [ ] **Dashboard loads** - Shows user statistics
- [ ] **Log meal** - Add a meal and see calorie count
- [ ] **Log water** - Add water intake
- [ ] **Log sports** - Log exercise activity
- [ ] **Workout routines** - Create and view routines
- [ ] **Workout scheduler** - Set up weekly schedule
- [ ] **Data persists** - Refresh page, data still there
- [ ] **No API errors** - Open DevTools → Network tab, no 5xx errors

### Backend (Railway URL) ✓

Test API endpoints directly:

```bash
# Health check
curl https://fittrack-backend.up.railway.app/

# Should return:
# {"message":"🏋️ FitTrack API is running!","version":"1.0.0",...}
```

Test authentication:

```bash
# Signup
curl -X POST https://fittrack-backend.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "email":"test@example.com",
    "password":"Test123!@"
  }'

# Should return: user object and JWT token
```

### Database (MongoDB Atlas) ✓

1. Go to **[mongodb.com/atlas](https://mongodb.com/atlas)**
2. Click your project
3. Click **Browse Collections**
4. You should see collections:
   - `users` - Contains user accounts
   - `daydata` - Contains daily fitness logs
   - `workoutroutines` - Saved workout routines
   - `workoutschedules` - Weekly schedules
5. Create an account in your app (Step 1 above)
6. Check `users` collection - new user should appear

---

## 🚀 After Deployment: Improvements to Implement

Your app is now live! Consider these enhancements:

### User Experience
- [ ] **Email Verification** - Verify emails on signup
- [ ] **Password Reset** - "Forgot Password" functionality
- [ ] **Social Login** - Sign in with Google/GitHub
- [ ] **Dark Mode** - Theme switcher
- [ ] **Mobile Optimization** - Responsive design improvements

### Performance
- [ ] **Image Optimization** - Compress and lazy-load images
- [ ] **Code Splitting** - Split React bundles
- [ ] **Caching Strategy** - Cache API responses
- [ ] **CDN Optimization** - Serve static files via CDN
- [ ] **Database Indexing** - Index frequently queried fields

### Features
- [ ] **Notifications** - Email reminders for goals
- [ ] **Social Sharing** - Share progress with friends
- [ ] **API Documentation** - Swagger/OpenAPI docs
- [ ] **Admin Dashboard** - Manage users and content
- [ ] **Export Data** - Download user data as CSV/PDF

### Monitoring & Security
- [ ] **Error Tracking** - Sentry for production errors
- [ ] **Analytics** - Google Analytics or Mixpanel
- [ ] **Security Headers** - HSTS, CSP, X-Frame-Options
- [ ] **Rate Limiting** - Already implemented ✓
- [ ] **HTTPS** - Already enabled ✓

### Scalability
- [ ] **Database Upgrade** - Move beyond M0 tier if needed
- [ ] **CDN Usage** - Cache static assets globally
- [ ] **Load Testing** - Test with 1000+ concurrent users
- [ ] **Microservices** - Split backend into services (optional)
- [ ] **WebSocket/Real-time** - Live notifications

---

## 🔧 Troubleshooting

### Frontend Deployment Issues

**Problem: CORS errors in browser console**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Check `VITE_API_URL` environment variable in Vercel settings
- Ensure it ends with `/api`
- Redeploy after fixing

**Problem: Blank page or 404**
```
Solution:
- Check build logs in Vercel dashboard
- Run `npm run build` locally to test
- Verify all environment variables are set
```

### Backend Deployment Issues

**Problem: "Failed to connect to MongoDB"**
```
Solution:
- Verify `MONGO_URI` in Railway environment variables
- Check MongoDB Atlas network access includes `0.0.0.0/0`
- Test connection string locally
```

**Problem: Backend URL not accessible**
```
Solution:
- Wait 5 minutes after deployment
- Check Railway deployment logs for errors
- Verify `PORT` environment variable is set to `5000`
```

### Database Connection Issues

**Problem: "Cannot connect to MongoDB Atlas"**
```
Solution:
- Go to MongoDB Atlas Security > Network Access
- Verify Railway IP is whitelisted (0.0.0.0/0)
- Check credentials match exactly in connection string
```

---

## 🔐 Security Checklist

Before going to production, verify:

- [ ] **JWT_SECRET** - Is a strong, random 32-character string (not the default)
- [ ] **CORS** - Only allows your Vercel domain
- [ ] **HTTPS** - All URLs use https:// (automatic on Vercel/Railway)
- [ ] **Rate Limiting** - Enabled on auth endpoints (already configured)
- [ ] **No Debug Mode** - `NODE_ENV=production` on Railway
- [ ] **Error Messages** - Don't expose sensitive info
- [ ] **Password Requirements** - Enforced on signup
- [ ] **Token Expiration** - JWT expires after 30 days

---

## 📞 Support & Resources

| Resource | Link |
|----------|------|
| **Vercel Docs** | https://vercel.com/docs |
| **Railway Docs** | https://railway.app/docs |
| **MongoDB Atlas Docs** | https://docs.atlas.mongodb.com |
| **Express.js Docs** | https://expressjs.com |
| **React Docs** | https://react.dev |

---

## 📝 Deployment Checklist (Quick Reference)

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created + credentials saved
- [ ] Railway backend deployed with environment variables
- [ ] Railway backend URL noted
- [ ] Vercel frontend deployed with API URL configured
- [ ] Frontend loads without errors
- [ ] Signup/login works
- [ ] Data appears in MongoDB Atlas
- [ ] All tests pass ✓

**Congratulations! 🎉 Your app is live in production!**

---

**Last Updated:** April 2026  
**FitTrack Version:** 1.0.0  
**Deployment Stack:** Vercel + Railway + MongoDB Atlas

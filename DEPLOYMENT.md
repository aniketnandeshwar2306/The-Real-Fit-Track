# FitTrack Deployment Guide

## 🚀 Quick Start - Deploy in 5 Minutes

### **Part 1: Backend Deployment (Railway)**

1. **Go to** https://railway.app → Sign up (free)
2. **Create new project** → Select "Deploy from GitHub"
3. **Connect your GitHub repo** (if not done, push code to GitHub first)
4. **Select the `backend` folder**
5. **Add environment variables** (Settings panel):
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Any random secret string
   - `PORT`: 5000

6. **Deploy** → Copy the public URL (e.g., `https://fittrack-api.railway.app`)

---

### **Part 2: Frontend Deployment (Vercel)**

1. **Go to** https://vercel.com → Sign up (free)
2. **Import your GitHub repo**
3. **Configure**:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Add environment variable**:
   - `VITE_API_URL`: Your Railway backend URL from Part 1
5. **Deploy** → Your app goes live! 🎉

---

## 📋 What You Need

### **1. GitHub Repository**
Your code must be on GitHub. Do this once:
```bash
git init
git add .
git commit -m "Initial commit - FitTrack with analytics"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fittrack-react.git
git push -u origin main
```

### **2. MongoDB Atlas (Free)**
- Sign up: https://www.mongodb.com/atlas
- Create a free M0 cluster
- Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/fittrack`

### **3. Environment Variables for Production**

**Backend (.env on Railway)**:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fittrack
JWT_SECRET=your_super_secret_key_123456
PORT=5000
```

**Frontend (Vercel - set in dashboard)**:
```
VITE_API_URL=https://your-railway-backend.railway.app
```

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Railway backend deployed
- [ ] Vercel frontend deployed
- [ ] Environment variables set on both
- [ ] Test endpoint: `https://your-railway-api.railway.app/api/auth/login` (should return 405 - method not allowed, that's OK)
- [ ] Test app: Open your Vercel URL and sign up

---

## 🔧 Debugging

**Frontend won't connect to backend?**
- Check: `VITE_API_URL` is set correctly in Vercel
- Should NOT end with `/` (e.g., `https://...railway.app` NOT `https://...railway.app/`)

**Backend errors?**
- Check MongoDB connection: View Railway logs
- Check JWT_SECRET is set

**Can't push to GitHub?**
- Generate GitHub Personal Access Token (Settings → Developer Settings)
- Use token as password when git asks

---

## 📊 Result

Once deployed:
- **Frontend**: https://fittrack-react.vercel.app (example)
- **Backend**: https://fittrack-api.railway.app (example)
- **Public URL**: Share the frontend URL with anyone!

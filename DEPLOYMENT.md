# 🚀 DMS Production Deployment Guide

## Overview
This guide will help you deploy your DMS (Data Management System) to production for **15-20 live users** (workers + admins).

**Architecture:**
- **Frontend**: React + Vite → Vercel
- **Backend**: Node.js + Express → Railway
- **Database**: MongoDB → MongoDB Atlas

**Expected Cost**: $0-25/month (mostly free tier)

---

## 📋 Prerequisites

1. **GitHub Account** (for code hosting)
2. **Vercel Account** (frontend hosting)
3. **Railway Account** (backend hosting)
4. **MongoDB Atlas Account** (database hosting)

---

## 🗄️ Step 1: Database Setup (MongoDB Atlas)

### 1.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up/Login and create a new project
3. Click "Create Cluster" → Choose **FREE** shared cluster
4. Select your preferred region (closest to your users)
5. Cluster name: `dms-production`

### 1.2 Configure Database Access
1. **Database Access** → Add Database User
   - Username: `dms-admin`
   - Password: Generate strong password (save it!)
   - Role: `Atlas Admin`

2. **Network Access** → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Comment: "Production Access"

### 1.3 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string:
   ```
   mongodb+srv://dms-admin:<password>@dms-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name: `...mongodb.net/dms?retryWrites=true&w=majority`

---

## 🖥️ Step 2: Backend Deployment (Railway)

### 2.1 Prepare Backend
1. Push your code to GitHub (if not already done)
2. Make sure all files are committed:
   ```bash
   cd be
   git add .
   git commit -m "Production ready backend"
   git push
   ```

### 2.2 Deploy to Railway
1. Go to [Railway](https://railway.app/)
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your repository → Choose `be` folder
5. Railway will auto-detect Node.js and deploy

### 2.3 Configure Environment Variables
In Railway dashboard → Your project → Variables tab:

```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://dms-admin:YOUR_PASSWORD@dms-production.xxxxx.mongodb.net/dms?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-generate-a-strong-one
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 2.4 Test Backend
1. Railway will provide a URL like: `https://your-app.railway.app`
2. Test health endpoint: `https://your-app.railway.app/health`
3. Should return: `{"status":"OK","timestamp":"...","uptime":...}`

---

## 🌐 Step 3: Frontend Deployment (Vercel)

### 3.1 Prepare Frontend
1. Update your API calls to use environment variable:
   ```javascript
   // In your API configuration file
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
   ```

### 3.2 Deploy to Vercel
1. Go to [Vercel](https://vercel.com/)
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your repository → Select `fe` folder
5. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `fe`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Configure Environment Variables
In Vercel dashboard → Your project → Settings → Environment Variables:

```bash
VITE_API_URL=https://your-backend-url.railway.app
```

### 3.4 Update CORS in Backend
1. Go back to Railway
2. Update `CORS_ORIGIN` variable with your Vercel URL:
   ```bash
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

---

## ✅ Step 4: Final Testing

### 4.1 Test Complete Flow
1. Visit your Vercel URL
2. Test user registration/login
3. Test worker data entry
4. Test admin functionality
5. Check if data persists in MongoDB Atlas

### 4.2 Performance Monitoring
1. **Vercel**: Built-in analytics and monitoring
2. **Railway**: Check logs and metrics in dashboard
3. **MongoDB Atlas**: Monitor database performance

---

## 🔧 Step 5: Production Configuration

### 5.1 Custom Domain (Optional)
**Vercel:**
1. Domains tab → Add custom domain
2. Follow DNS configuration instructions

**Railway:**
1. Settings → Custom Domain
2. Add your backend subdomain (e.g., `api.yourdomain.com`)

### 5.2 SSL Certificates
- **Vercel**: Automatic SSL certificates
- **Railway**: Automatic SSL certificates
- **MongoDB Atlas**: SSL enabled by default

---

## 📊 Expected Performance

For **15-20 concurrent users**:
- **Response time**: < 200ms
- **Uptime**: 99.9%
- **Concurrent requests**: 100+ easily handled
- **Database**: Handles thousands of documents

---

## 💰 Cost Breakdown

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| **Vercel** | 100GB bandwidth | $20/month |
| **Railway** | $5 credit/month | $5-10/month |
| **MongoDB Atlas** | 512MB storage | $9/month |
| **Total** | **~$0/month** | **~$25/month** |

*Your usage will likely stay in free tiers*

---

## 🆘 Troubleshooting

### Common Issues:

**1. CORS Errors**
- Check `CORS_ORIGIN` in Railway matches your Vercel URL
- Ensure no trailing slashes

**2. Database Connection Failed**
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format
- Ensure password doesn't contain special characters

**3. Build Failures**
- Check Node.js version compatibility (18+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

**4. Environment Variables Not Working**
- Restart deployments after adding variables
- Check variable names (case-sensitive)
- Ensure VITE_ prefix for frontend variables

---

## 🔄 Deployment Updates

### For Code Changes:
1. **Frontend**: Push to GitHub → Vercel auto-deploys
2. **Backend**: Push to GitHub → Railway auto-deploys

### For Environment Variables:
1. Update in respective dashboards
2. Restart deployments if needed

---

## 📞 Support

If you encounter issues:
1. Check service status pages
2. Review deployment logs
3. Test locally first
4. Check this documentation

**Your DMS is now production-ready for 15-20 users!** 🎉 
# 🚀 Deployment Guide: FloraMath Next.js Fullstack

This project has been refactored into a single **Next.js Fullstack** application using **Prisma** for the database handling. Due to Serverless constraints, we use **PostgreSQL**.

---

## ☁️ Step 1: Push to GitHub
If you haven't recently:
1. Stage your changes: `git add .`
2. Commit: `git commit -m "feat: migrate to fullstack nextjs postgres"`
3. Push: `git push origin main`

---

## 🗄️ Step 2: Vercel Postgres Setup
Local SQLite is great, but Vercel requires PostgreSQL for production.
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Go to the **Storage** tab.
3. Click **Create Database** and select **Postgres**.
4. Once created, click on it and navigate to the **.env.local** tab. Look for the `DATABASE_URL` (it will start with `postgres://` or `postgresql://`). 
   - **Important:** Copy this connection string.

---

## 💻 Step 3: Local Synchronization (Optional but Recommended)
To test your app or sync the tables before deployment:
1. Open your `frontend/.env` file.
2. Replace the local SQLite file path with your new Vercel DB URL:
   ```env
   DATABASE_URL="postgres://..."
   ```
3. Sync the production database tables from your terminal inside the `frontend` folder:
   ```powershell
   npx prisma db push
   ```

---

## 🚄 Step 4: Deploy on Vercel
1. Go back to Vercel and click **Add New Project**.
2. Import your GitHub repository.
3. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: Select `frontend` (Important!). Select "Edit" to choose this if it defaults to root.
4. **Environment Variables**:
   - Make sure your `DATABASE_URL` is configured here or linked via the Storage tab automatically.
5. Click **Deploy**.

🎉 **That's it! Everything — UI, API routes, Database logic — is now deployed successfully as a single optimized unified unit.**

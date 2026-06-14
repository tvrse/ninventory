# Setup Guide

## 1. Neon Database

1. Go to https://neon.tech and sign up (free)
2. Create a new project → name it `switch-game-tracker`
3. Copy the **Connection string** (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
4. Paste it as `DATABASE_URL` in `.env.local`

## 2. RAWG API Key (game search)

1. Go to https://rawg.io/apidocs and sign up (free)
2. Get your API key
3. Paste it as `RAWG_API_KEY` in `.env.local`

## 3. Auth Secret

Run this in your terminal and paste the output as `AUTH_SECRET`:
```
openssl rand -base64 32
```

## 4. Push database schema

```bash
npm run db:push
```

## 5. Run the app

```bash
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel (optional)

```bash
npx vercel
```

Add the same environment variables in Vercel dashboard → Settings → Environment Variables.
Change `NEXTAUTH_URL` to your Vercel URL.

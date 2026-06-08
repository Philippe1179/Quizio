# Quizio

Trivia and geography quiz app with daily challenges, streaks, and leaderboards.

**Live:** [quizio.vercel.app](https://quizio.vercel.app)

## Features

- **Daily Challenge** — 10 new questions every day, same for everyone. One attempt, global leaderboard, streak tracking.
- **Quiz Categories** — Multiple choice and type-the-answer across geography, history, science, sports, and pop culture.
- **Interactive Games** — USA map, world map, flag quiz, periodic table, and US presidents.
- **Leaderboard** — Daily rankings with completion time as tiebreaker. Hall of fame for longest streaks.
- **Streaks** — Track your daily challenge streak. At-risk warning if you haven't played yet.
- **Profiles** — Personal score history and stats.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [Firebase](https://firebase.google.com) (Auth + Firestore)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel](https://vercel.com) (Deployment)

## Development

```bash
npm install
npm run dev
```

Create a `.env.local` file with your Firebase config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

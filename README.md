# Alva Operations Dashboard

Realtids-dashboard för AI-assistenten Alva på ai-projektering.se.

## Tech Stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS 4 (dark mode only)
- Supabase (Auth + Database + Realtime)
- Vercel deployment

## Setup

### 1. Installera dependencies

```bash
npm install
```

### 2. Konfigurera miljövariabler

Kopiera `.env.local.example` till `.env.local` och fyll i dina Supabase-uppgifter:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Kör databas-migrationen

Kör SQL-filen i `supabase/migrations/001_initial_schema.sql` i Supabase SQL Editor.

### 4. Skapa en användare

I Supabase Dashboard → Authentication → Users, skapa en användare med e-post och lösenord.

### 5. Starta utvecklingsservern

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Deploy till Vercel

1. Pusha till GitHub
2. Importera projektet i Vercel
3. Lägg till miljövariablerna i Vercel
4. Deploy!

## Struktur

```
src/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Dashboard (huvudsida)
│   ├── globals.css       # Tailwind + custom styles
│   └── login/
│       └── page.tsx      # Inloggningssida
├── components/
│   ├── StatusBar.tsx     # Toppbar med status
│   ├── TaskPipeline.tsx  # Vänster kolumn - uppgifter
│   ├── ThoughtStream.tsx # Mitten - tankeström
│   ├── ThoughtCard.tsx   # Enskilt tanke-kort
│   ├── ActivityLog.tsx   # Höger kolumn - aktivitetslogg
│   ├── StatusFooter.tsx  # Footer med statistik
│   └── NewTaskModal.tsx  # Modal för ny uppgift
├── hooks/
│   └── useRealtimeDashboard.ts  # Realtime-hook
├── lib/
│   ├── types.ts          # TypeScript-typer
│   └── supabase/
│       ├── client.ts     # Browser-klient
│       ├── server.ts     # Server-klient
│       └── middleware.ts # Auth middleware
└── utils/
    └── formatters.ts     # Tidsformaterare etc.
```

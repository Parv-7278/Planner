# 🌟 DAYLY — Your Entire Day. Planned.

> **DAYLY** is an intelligent day-planning and experience-booking platform that connects dining, movies, workshops, escape rooms, VR, museums, nature walks, sports, and nightlife into one unified day outside.

---

## 🚀 Key Features

- **Natural Language AI Day Planner**: Type requests like *"Plan a date for two under ₹3000"* or choose curated prompts.
- **12 Curated Experience Categories**: Food & Dining, Cinema & Plays, Activities & VR, Pottery & Craft Workshops, Museums & Heritage, Sports & Racing, Nature & Parks, Bazaars & Malls, Nightlife & Jazz, Family & Kids, Romantic Dates, and Spas.
- **Smart Itinerary Engine**: Chronological scheduling with opening hours, transit calculations, conflict prevention, and travel buffers.
- **Interactive Day Timeline & Route Map**: Drag, nudge timings (`+/- 30m`), swap activities, and visualize routes with transit mode toggles (Car, Metro, Bike, Walking).
- **Universal Ticket Booking**: Multi-step checkout with mock payments, QR turnstile digital passes, and celebratory confetti.
- **DAYLY Virtual Queue Bot**: Automated waitlist progression simulation (`#37 ➔ #25 ➔ #12 ➔ #4 ➔ Available`) with auto-booking and alerts.
- **Real-Time Day Mode**: Active personal assistant with countdown timer, digital turnstile QR, and dynamic traffic warning auto-adjustments.
- **"What If?" Simulator**: Recalculates itineraries for rain, late start, skipped cinema, or budget changes.
- **Group Planning & Collaborative Voting**: Invite friends with a room code, vote 👍/👎 on activities, and generate consensus plans.
- **Notification Center & Toasts**: Real-time reminders, waitlist status alerts, and traffic tips.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Routing**: React Router DOM v7
- **Styling**: Vanilla CSS Design System with Glassmorphism, CSS Custom Properties, and responsive mobile-first layouts
- **Icons**: Custom Lightweight SVG Vector Icon Library
- **Build Tool**: Vite 8 (Rolldown engine)
- **Delight**: Canvas Confetti

---

## ⚙️ Environment Variables

The project includes pre-configured environment files:
- `.env` — Local development configuration (includes your Supabase credentials, gitignored)
- `.env.example` — Environment template
- `.env.production` — Production configuration reference

When deploying to Vercel, Netlify, or any production cloud host, add these environment variables in your provider dashboard:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Tests
```bash
npm test
```
Runs the full 20-test suite validating the itinerary scheduling engine and booking assistant queue logic.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 🚀 One-Click Cloud Deployment

### Deploying to Vercel
1. Import your GitHub repository (`https://github.com/Parv-7278/Planner`) in [Vercel](https://vercel.com).
2. Framework Preset: **Vite** (Root Directory: `./`).
3. Add Environment Variables:
   - `VITE_SUPABASE_URL`: your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: your Supabase Anon public key
4. Click **Deploy**. SPA routing rewrites are pre-configured via `vercel.json`.

### Deploying to Netlify
1. Connect repository in [Netlify](https://app.netlify.com).
2. Build command: `npm run build` | Publish directory: `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Environment Variables.
4. Deploy site. SPA routing redirects are handled via `public/_redirects`.

---

## 📄 License
MIT License. Crafted for unforgettable days out.

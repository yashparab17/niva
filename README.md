# niva

A small appointments product for a nutritionist. Two sides share one Supabase database:

- **Client app** (`/`, `/book`, `/appointments`): mobile-first. Clients see their next appointment, book a slot, and reschedule or cancel.
- **Dashboard** (`/dashboard`): the nutritionist's list. She can change status (Booked, Done, No-show), add appointments by hand, filter to today, send a WhatsApp reminder and remove entries.

Anything booked on one side shows up on the other. Both sides refresh themselves every 15 seconds.

## Features

- Pick a day and an open time slot; taken and past slots are disabled.
- No double booking: the database enforces it (see below).
- Light and dark themes with an animated toggle; the choice is remembered.
- Helps with no-shows:
  - **I'll Be There**: clients confirm their next appointment in one tap, and the dashboard shows a "Confirmed" tag.
  - **WhatsApp reminder**: one tap on the dashboard opens a chat with the message already written.
  - **Easy reschedule and cancel**: two taps, and the slot is freed for someone else.
  - **Needs update**: past appointments still marked Booked are flagged so none go unrecorded.

## Tech

Next.js 16 (Cache Components) · React 19 · Tailwind CSS 4 · react-aria-components · shadcn/ui · Hugeicons · Supabase (Postgres) · Manrope and Fraunces.

## Run it locally

You need Node 20+, [pnpm](https://pnpm.io) and a free [Supabase](https://supabase.com) project.

1. **Create the database.** In Supabase open SQL Editor, paste [`supabase/schema.sql`](supabase/schema.sql) and run it once. It creates the `appointments` table, the rules around it, and the cleaned sample data. Don't run it twice, or the sample rows will be inserted again.
2. **Add your keys.** Copy `.env.example` to `.env.local` and fill it in:

   | Variable | Where to find it |
   | --- | --- |
   | `SUPABASE_URL` | Project Settings → API → Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → the **secret** key (`sb_secret_...`) |

   Use the secret key, not the publishable one. The app only talks to Supabase from the server, and the publishable key is rejected by the database's access rules (the app stops at startup with a clear message if you paste it by mistake).
3. **Start the app.**
   ```bash
   pnpm install
   pnpm dev
   ```
   Open <http://localhost:3000> for the client app and <http://localhost:3000/dashboard> for the dashboard.

## Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel. The Next.js preset needs no changes.
2. In Project Settings → Environment Variables add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Tick **Production, Preview and Development**: the build imports the Supabase client, so it fails without them.
3. Deploy. Keep the Vercel function region close to your Supabase region for snappy pages.

Never prefix the secret key with `NEXT_PUBLIC_`.

## Checking it on your phone

- **Easiest:** open your Vercel URL on the phone.
- **Local network:** run `pnpm dev`, then open `http://<your-computer-ip>:3000` on a phone on the same Wi-Fi. If the page loads but buttons do nothing, add your IP to `allowedDevOrigins` in `next.config.ts`; Next blocks dev scripts from other origins by default.
- **Desktop:** use the browser's device mode (375 px wide) to check the layout and the bottom tab bar.

Things worth trying: book a slot in the client app and watch it appear in the dashboard, change its status there and see it update on the client side, and flip the theme toggle.

## How it works

- **Double booking** is blocked by a unique partial index on `(date, time)` where `status = 'booked'`. If two people grab the same slot, the second gets "That time was just taken" and fresh availability.
- **Clients have no login.** Their phone number, stored in a cookie, identifies them, and every reschedule, cancel or confirm is scoped to it.
- **Security:** row-level security is on with no policies, so only the server's secret key can reach the table.
- **Time:** all dates and times use the clinic's timezone (`Asia/Kolkata`) in 30-minute slots from 9:00 to 16:30, whatever the server's timezone is.
- **Sample data** was cleaned on the way in: day-first dates, 24-hour times, one 10-digit format for phones (Riya's two numbers were the same), and a missing phone left empty.

## Project layout

```text
src/app/(client)/      client pages: home, book, appointments
src/app/dashboard/     nutritionist dashboard
src/app/actions/       server actions (book, reschedule, cancel, status...)
src/app/api/slots/     slot availability for the date picker
src/components/        UI, split into client/ and dashboard/
src/lib/               Supabase client, queries, time and status helpers
supabase/schema.sql    table, rules and sample data
scripts/               recolours unDraw illustrations to the theme
public/illustrations/  themed light and dark illustrations
```

To add or swap illustrations, put the unDraw SVGs in `illustrations/raw/` (git-ignored) and run `python scripts/recolor_illustrations.py`.

## Known limits

- The dashboard has no login, as the brief asked. Add Supabase Auth before real use.
- Phone numbers are 10-digit Indian numbers.
- Clients can book up to 21 days ahead.
- The sample appointments are dated October 2026, so after that date they show as past and flagged "Needs update".

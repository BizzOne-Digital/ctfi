# Country Tyme Foto Imaging — Website & Admin Platform

A production-grade website and CMS for Country Tyme Foto Imaging, LLC, built with Next.js (App Router),
TypeScript, Tailwind CSS, and MongoDB. The public site, the appointment booking system, the password-protected
client galleries, and the entire admin dashboard are all driven by the database — there is no business content
hard-coded into the source beyond clearly-labeled placeholders.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, Route Handlers)
- **Language:** TypeScript, strict mode
- **Styling:** Tailwind CSS v4, theme driven by runtime CSS variables (see Theming below)
- **Database:** MongoDB via Mongoose, with images stored in MongoDB GridFS (no external storage required)
- **Auth:** Custom JWT sessions in httpOnly cookies (`jose`), bcrypt password hashing (`bcryptjs`)
- **Forms/validation:** `react-hook-form` + `zod`, validated again on the server for every request
- **Notifications:** `sonner` toasts in the admin dashboard

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in real values:

   ```bash
   cp .env.example .env.local
   ```

   At minimum you need `MONGODB_URI`, `ADMIN_SESSION_SECRET`, and `GALLERY_SESSION_SECRET`. Generate strong
   secrets with `openssl rand -base64 48`.

3. **Seed the database** (creates the first admin login + starter content)

   ```bash
   npm run seed
   ```

   This prints the admin email/password it created (or uses `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from
   your `.env.local` if set). **Sign in and change the password immediately.**

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Public site: [http://localhost:3000](http://localhost:3000)
   Admin dashboard: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

5. **Build for production**

   ```bash
   npm run build && npm run start
   ```

## What the Admin Can Do Without Touching Code

- **Home & About page content** — every heading, paragraph, image, and button, section by section, with
  show/hide toggles (`/admin/content/home`, `/admin/content/about`).
- **Services** — full CRUD, image, pricing, ordering, active/inactive (`/admin/services`).
- **Appointments** — view/search/filter, approve/reject/reschedule/complete/cancel, internal notes
  (`/admin/appointments`), plus working hours/duration/breaks/closed dates (`/admin/appointments/settings`).
- **Client Galleries** — password-protected galleries with albums, photo upload, cover photo, per-gallery
  download/sharing toggles, and expiration (`/admin/galleries`).
- **Media Library** — every uploaded image in one place, searchable by folder (`/admin/media`).
- **Contact Messages** — inbox with unread/read/contacted/archived status (`/admin/messages`).
- **Site Settings** — business info, logo, favicon, social links, SEO/OG, footer text (`/admin/settings`).
- **Theme & Appearance** — colors, button/corner style, heading font, hero/header style, spacing, with a live
  preview (`/admin/theme`).
- **Navigation** — labels, URLs, order, and visibility (`/admin/navigation`).

## Architecture Notes

### Data model

See `src/models/*.ts`. Collections: `AdminUser`, `SiteSettings`, `ThemeSettings`, `NavigationItem`,
`PageContent` (Home/About sections), `Service`, `Appointment`, `AvailabilitySettings`, `ContactMessage`,
`ClientGallery`, `GalleryAlbum`, `GalleryImage`, `Media` (metadata; bytes live in GridFS).

### Media storage

Uploaded images are streamed into MongoDB's GridFS (`src/lib/gridfs.ts`) — metadata lives in the `Media`
collection, bytes live in GridFS chunks in the same database. This means **no images are ever written to the
local filesystem**, so the app is safe to deploy to serverless platforms (Vercel, etc.) where the filesystem
is ephemeral. `src/app/api/media/[id]/route.ts` streams files back out, and enforces gallery privacy (see
below) before doing so.

If you later want to move to S3/Cloudinary/Vercel Blob for scale, only `src/lib/gridfs.ts` and the upload
routes need to change — the `Media` model and the rest of the app are storage-agnostic.

### Admin authentication

- `src/lib/auth.ts` signs/verifies short-lived JWTs with `jose` (Edge-compatible, so it works in middleware).
- Sessions are httpOnly, `sameSite=lax` cookies — never exposed to client JavaScript.
- `src/proxy.ts` (Next.js's middleware convention, renamed to "proxy" in Next 16) blocks any unauthenticated
  request to `/admin/*` or `/api/admin/*` before it reaches a page or route handler.
- Every `/api/admin/**` route also calls `requireAdmin()` itself (`src/lib/admin-guard.ts`) as defense in
  depth, in case the proxy matcher is ever changed.
- Passwords are hashed with bcrypt (cost factor 12); plaintext passwords are never stored or logged.

### Client gallery security

This was the most safety-critical feature, so it's worth spelling out:

- Gallery passwords are hashed with bcrypt — never stored or compared in plaintext.
- A successful gallery login issues a JWT scoped to that **one** gallery's ID, stored in a cookie **named
  after that gallery's ID** (`ctfi_gallery_<galleryId>`). A session for Gallery A has no way to authorize
  access to Gallery B — the server checks the specific cookie for the specific gallery on every request.
- The gallery login endpoint always runs a bcrypt comparison (even for a gallery that doesn't exist, against
  a dummy hash) and returns one generic error either way, so the response doesn't leak which gallery slugs
  are real.
- Gallery login attempts are rate-limited per IP+slug (`src/lib/rate-limit.ts`).
- Gallery images are never served by a public, guessable-ID endpoint. `src/app/api/media/[id]/route.ts`
  looks up which gallery a "gallery" folder image belongs to and requires that gallery's session cookie (or
  an authenticated admin) before returning bytes — a raw `GET /api/media/<id>` for someone else's photo
  returns 403/404, not the image.
- Expired or deactivated galleries are treated as not found, and their session length is capped to the
  configured expiration date.
- Gallery pages are marked `noindex` so search engines never surface a client's private photos.

**Known limitation to be aware of:** the rate limiter is in-memory per server instance. On a multi-instance
serverless deployment it resets per instance/cold start. For stronger brute-force protection at scale, swap
`src/lib/rate-limit.ts` for a Redis/Upstash-backed limiter — every call site already goes through that one
file.

### Appointment booking & double-booking prevention

- `src/lib/availability.ts` computes open slots from `AvailabilitySettings` (working days/hours, appointment
  length, buffer, breaks, closed dates) minus any already-booked times that day.
- Booking is re-validated server-side at submission time (a client can't force a stale/invalid slot through).
- A partial unique index on `Appointment` (`preferredDate` + `preferredTime`, scoped to active statuses) is
  the hard backstop against two people booking the exact same slot in a race condition — the API catches the
  resulting duplicate-key error and returns a friendly "that time was just taken" message.

### Dynamic content & theming

Public pages are rendered dynamically (`export const dynamic = "force-dynamic"`) so admin edits appear on the
next request with no rebuild or redeploy. The `SiteSettings`/`ThemeSettings`/`NavigationItem`/`PageContent`
data flows through `src/lib/site-data.ts`, which always falls back to the same shipped defaults
(`src/lib/constants.ts`) if the database is briefly unreachable or a collection is empty, so the site never
shows a blank page or a crash to a visitor.

Theme colors, button style, corner radius, heading font, and spacing are stored in `ThemeSettings` and
injected as CSS variables in `src/app/layout.tsx` on every request — Tailwind utility classes like `bg-primary`
and `btn-radius` read those variables, so an admin's theme change applies across the whole site without
touching a single component.

### Email notifications — honest status

**No email-sending is implemented.** Nothing in this app claims to send a confirmation email that it hasn't
actually sent — appointment/contact confirmations are shown on-screen only, and the code comments in
`src/app/api/appointments/route.ts` / `src/app/api/contact/route.ts` mark exactly where to add a provider call
(e.g. Resend, Postmark, SES) once you choose one. Add the provider's API key to `.env.local` (see
`.env.example`) and wire the send call in those two route handlers; the data you need (customer email, service,
date/time) is already available at that point.

## Security Checklist (self-audit)

- [x] Admin pages and admin API routes are blocked for unauthenticated requests (proxy + per-route guard).
- [x] Gallery passwords are bcrypt-hashed, never returned by any API response.
- [x] A gallery session cannot be reused to access a different gallery's data or images.
- [x] Direct `/api/media/:id` requests for private gallery images require a valid session for that exact gallery.
- [x] Database credentials and session secrets are environment variables, not committed to source.
- [x] File uploads are validated for MIME type and size on the server (client-side checks are UX only).
- [x] All form input is validated server-side with `zod`, regardless of client-side validation.
- [x] Destructive actions (delete service/gallery/appointment/message) require admin auth and a confirmation
      dialog in the UI.
- [x] Client gallery pages are marked `noindex, nofollow`.
- [x] Error responses to the browser never include raw database errors or stack traces.

## Seed Data vs. Real Content

`npm run seed` creates **one** admin login and the same placeholder copy that already ships as in-app
fallbacks — clearly generic text like "Placeholder content — replace with your final service details from the
admin dashboard." It does **not** create fake testimonials, fake reviews, fake statistics, or any client
galleries/appointments/contact messages, since those must be real. Replace every placeholder from the admin
dashboard before launch.

## Project Structure

```
src/
  app/
    (site)/            Public site pages (home, about, services, contact, book, gallery)
    admin/
      login/           Admin sign-in (outside the dashboard shell)
      (dashboard)/      Everything behind the sidebar layout
    api/                Route handlers — public + /admin (protected) + /media (GridFS streaming)
  components/
    public/             Public site UI
    admin/               Admin dashboard UI
    ui/                  Shared primitives (Button, Field, Card, Modal, States)
  lib/                   DB connection, auth, GridFS, validation, availability engine, site/gallery data
  models/                Mongoose schemas
scripts/
  seed.ts                Seed script (see above)
```

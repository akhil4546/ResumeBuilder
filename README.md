# Resumé — Full-Stack Resume Builder

A modern resume builder built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind v4**, **Prisma**, and **PostgreSQL**.

## Features

- **Auth** — email/password (NextAuth/Auth.js v5) with optional Google & GitHub OAuth
- **Dashboard** — create, duplicate, rename, delete resumes
- **Section-based editor** with a **multi-page live preview** — content flows into real stacked page sheets with page breaks snapped to entry/bullet boundaries (and `break-inside: avoid` so PDF exports don't split entries either)
- Sections: contact, summary, experience, education, skills, projects, certifications, awards, languages, interests, and custom
- **Drag-and-drop** section reordering, per-item ordering, show/hide sections
- **Autosave** with save-status indicator
- **8 templates** (Modern, Sidebar, Executive, Timeline, Compact, Classic, Minimal, ATS) + **theme controls** (style presets, accent color, 11 fonts, size, line height, spacing, margins, heading style, one/two-column, US Letter/A4 page size, date format)
- **Headshot photo** support (uploaded & auto-resized) on templates that use it, with round/square + show/hide
- **Live-preview zoom** controls (zoom in/out, fit-to-width)
- **Export** — PDF (print), Word `.docx`, and JSON; **import** from our JSON or the [JSON Resume](https://jsonresume.org) standard
- **Public share links** (`/r/<slug>`) with view tracking
- **Resume insights** — completeness score + ATS-style checks
- **Pre-written content library** — suggested bullet points (by role) and summary examples, inserted with one click
- **Job-description matcher** — paste a JD to get a keyword match score, matched/missing keywords, and one-click "add to skills"
- **Version history** — save snapshots and restore any earlier version (auto-snapshots before a restore)
- **Undo / redo** — full editor history with ⌘Z / ⌘⇧Z and toolbar buttons
- **AI writing assistant (Claude)** — rewrite a bullet, generate role-specific bullets, write a summary, and get JD-tailoring tips. Powered by `claude-opus-4-8` via the Anthropic SDK; requires `ANTHROPIC_API_KEY` (features hide themselves when it's unset)
- **Application tracker (Teal-style)** — a drag-and-drop Kanban board (Saved → Applied → Interviewing → Offer → Rejected) where each job links to the resume/cover letter you used, with company, role, salary, location, posting URL, dates, and notes
- **Cover letter builder** with its own live preview and PDF export

## Prerequisites

Node.js 20.9+ and a PostgreSQL database. This workspace was bootstrapped with a
**userspace** install of both (no admin/Homebrew required):

- Node: `~/.local/node-*` (symlinked into `~/.local/bin`, already on `PATH`)
- PostgreSQL 18: `~/.local/pgsql/dist`, data dir `~/.local/pgsql/data`, port **5433**

## Database

The local Postgres instance is managed with `scripts/db.sh`:

```bash
scripts/db.sh start    # start the server (port 5433)
scripts/db.sh stop     # stop it
scripts/db.sh status   # check status
scripts/db.sh psql     # open a psql shell on the app DB
scripts/db.sh reset    # drop & recreate the database
```

Connection string (already in `.env`):

```
postgresql://resume:resume_pw@127.0.0.1:5433/resume_builder
```

## Getting started

```bash
# 1. Make sure the database is running
scripts/db.sh start

# 2. Apply migrations (first time / after schema changes)
npx prisma migrate dev

# 3. Run the dev server
npm run dev
# → http://localhost:3000
```

A test account already exists for convenience:

```
email:    test@example.com
password: password123
```

## Enabling OAuth (optional)

Fill these in `.env` and restart:

```
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

The login/register screens show the matching buttons automatically.

## Enabling the AI assistant (optional)

Set `ANTHROPIC_API_KEY` in `.env` and restart. The editor then shows AI actions
(Improve/Write bullets, Write summary, JD tailoring tips) powered by
`claude-opus-4-8`. With no key set, those buttons are hidden and the rest of the
app works unchanged.

## Scripts

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint
```

## Project structure

```
src/
  app/                      # routes (App Router)
    page.tsx                # landing
    login/, register/       # auth pages
    dashboard/              # resume list
    editor/[id]/            # resume editor
    cover-letters/          # cover letter list + editor
    print/[id]/             # printable resume (Save as PDF)
    print/cover/[id]/       # printable cover letter
    r/[slug]/               # public shared resume
    api/                    # auth, register, docx export
  components/
    templates/              # resume templates + shared renderers
    editor/                 # editor panels (sections, design, templates, insights, preview)
    coverletter/            # cover letter editor + renderer
    ui.tsx                  # shared UI primitives
  lib/
    resume/                 # schema (zod), defaults, insights, docx, json io
    coverletter/            # cover letter schema
    editor/store.ts         # zustand editor store
    prisma.ts, auth helpers
  server/actions/           # server actions (resume + cover letter CRUD)
prisma/schema.prisma        # data model
```

## Tech notes

- Built for **Next.js 16**: `params`/`searchParams` are awaited; route protection is
  done in server components (no `middleware`/`proxy`).
- Resume content is stored as structured JSON (validated by zod) for flexibility.
- PDF export uses the browser's print pipeline against a dedicated print route, so the
  output is pixel-accurate and the text stays selectable.

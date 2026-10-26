# TMFS Admin

Admin UI for the Time Machine Financial Services website ([tmfs](../tmfs)): leads, website traffic and email in one place. It's Next.js 15 (App Router, JavaScript) with Tailwind CSS v4.

It's the interface, plus outgoing CRM email over SMTP (nodemailer, `lib/mail.js`). All data, sign-in and the email log live in **[tmfs-backend](../tmfs-backend)** (Django). Server components and server actions call it from this app's server, with the signed-in member's token kept in an httpOnly cookie. The browser never talks to the backend directly.

## What's in it

| Page | What it shows |
| --- | --- |
| **Dashboard** | Visitors, page views, leads, conversion, bounce rate and median first-response time against the previous period. Also traffic and new-lead charts, live visitors (refreshed every 15s), pipeline, latest leads, follow-ups due, and top pages, channels and services. |
| **Leads** | Searchable, filterable list (status, service, channel, owner, sort) with a drag-and-drop pipeline board and CSV export. **New lead** logs phone, WhatsApp, email and walk-in enquiries. |
| **Lead** | Status, priority, owner, deal value, follow-up date and tags. An activity timeline holds notes, calls, WhatsApp, meetings, status changes and every email in or out. You can email the client from the page. Also shows attribution, the visitor's website journey, and related enquiries. |
| **Inbox** | Every email sent (website enquiry notifications and CRM replies), sent or failed. Client replies go to the `MAIL_FROM` mailbox. |
| **Analytics** | First-party website analytics: channels, sources, campaigns, pages, landing pages, contact clicks and form starts, locations, devices, browsers and OS. |
| **Visitors** | Recent sessions, filterable to sessions that became leads, and each visitor's full history. |
| **Settings** | Connection health, integration status with the exact URLs to paste, team members (admin / agent) and password changes. |

## Local development

Start [tmfs-backend](../tmfs-backend) first (port 8000), then:

```bash
npm install
cp .env.example .env.local     # BACKEND_URL=http://localhost:8000, plus SMTP_* to send email
npm run dev                    # http://localhost:3001
```

Sign in with the backend's `ADMIN_EMAIL` / `ADMIN_PASSWORD`. The first sign-in creates that admin; add everyone else under **Settings → Team**.

## Deploying (Vercel)

Import `tmfs-admin` as its own Vercel project, e.g. on `admin.timemachine.ae`, and set `BACKEND_URL` to the deployed backend's URL. Set the SMTP variables and `MAIL_FROM` from `.env.example` too. The website points at the backend, not at this app (see the backend README).

## Structure

- `lib/api.js`: the backend client (`api` for pages, `mutate` for server actions). `lib/auth.js` handles the session cookie and the current member.
- `app/(dash)/`: signed-in pages. Mutations are server actions next to each page (`actions.js`) that forward form posts to the backend.
- `app/api/live`, `app/(dash)/leads/export`: small proxies for the live card and the CSV download.
- `components/charts/`: dependency-free SVG charts with hover tooltips, keyboard support and a table view.
- `lib/constants.js`, `lib/ranges.js`, `lib/format.js`: UI vocabulary, date ranges and vitals thresholds, and Dubai-time formatting.

# Bookd Admin

Admin dashboard for the Bookd platform, a booking and travel assistant product. It is used by internal staff to manage users, roles and permissions, subscription plans, bookings, and FAQs.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Formik + Yup (forms and validation)
- ApexCharts / Chart.js (data visualization)
- FullCalendar (scheduling and calendar views)
- Axios (HTTP client)
- Socket.IO client (real-time updates)

## Prerequisites

- Node.js 18 or later
- npm

## Setup

```bash
git clone <repo-url>
cd bookd-admin
npm install
cp .env.example .env
```

Fill in the values in `.env`:

- `PORT` — port the dev server runs on
- `VITE_API_URL` — base URL of the Bookd backend API
- `VITE_ENCRYPT_DATA_KEY` — secret key used to encrypt session data stored in localStorage; generate a strong random value and do not reuse it across environments

Then start the dev server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally

## Build

```bash
npm run build
```

The build output is generated according to the Vite configuration. The application is served under the `/admin` base path, so it should be deployed behind a matching route or subpath on the host server.

## License

MIT — see LICENSE.md

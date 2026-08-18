# Bookd

Bookd is an AI-powered booking and travel assistant web app. This repository
contains the customer-facing frontend for the Bookd platform, built with
React, Vite, TypeScript, and Tailwind CSS.

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Router](https://reactrouter.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Stripe.js](https://stripe.com/docs/js) for payments
- [Google OAuth](https://www.npmjs.com/package/@react-oauth/google) for sign-in
- [Socket.IO client](https://socket.io/) for realtime communication
- [ElevenLabs](https://elevenlabs.io/) for voice/AI features

## Prerequisites

- Node.js 20.x
- npm

## Getting Started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd bookd-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Then fill in the values in `.env`. See `.env.example` for the list of
   required variables and what each one is used for.

4. Start the development server:

   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` — start the Vite development server with hot module reload.
- `npm run build` — type-check the project and produce a production build.
- `npm run lint` — run ESLint over the project.
- `npm run preview` — locally preview the production build.

## Building for Production

```bash
npm run build
```

The build output is generated in the `dist` directory.

## License

MIT — see [LICENSE](./LICENSE).

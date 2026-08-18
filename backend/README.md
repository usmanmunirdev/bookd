# Bookd Backend

NestJS API backend powering the Bookd booking/travel-assistant platform. It
handles authentication, bookings, the AI chat assistant (OpenAI + Pinecone),
payments (Stripe), notifications (Twilio + SendGrid/SMTP), and travel-provider
integrations (Hotelbeds, Amadeus, Google Calendar).

## Tech stack

- [NestJS](https://nestjs.com/) + TypeScript
- PostgreSQL with [TypeORM](https://typeorm.io/)
- Socket.IO (`@nestjs/websockets`, `@nestjs/platform-socket.io`) for real-time features
- [OpenAI](https://platform.openai.com/) and [Pinecone](https://www.pinecone.io/) for the AI chat assistant
- [Stripe](https://stripe.com/) for payments and subscriptions
- [Twilio](https://www.twilio.com/) for SMS notifications
- [SendGrid](https://sendgrid.com/) / SMTP (nodemailer) for email notifications
- Google OAuth for Google Calendar integration
- Hotelbeds and Amadeus APIs for hotel and flight search/booking

## Prerequisites

- Node.js 20 or later (Node 22 recommended)
- A reachable PostgreSQL database instance

## Setup

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd bookd-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Fill in the values in `.env`. A PostgreSQL database must exist and be
   reachable via the `POSTGRES_*` variables before the app will start. The
   various third-party API keys (OpenAI, Stripe, Twilio, SendGrid/SMTP,
   Google OAuth, Hotelbeds, Amadeus) are only required for the features that
   use them — the app will start without them, but the corresponding
   integrations will not work.

4. Start the app in development mode:

   ```bash
   npm run start:dev
   ```

## Available scripts

- `npm run build` — compile the project with `nest build`
- `npm run start` — run the compiled app (`dist/main.js`)
- `npm run start:dev` — run the app in watch mode
- `npm run start:debug` — run the app in watch mode with the debugger attached
- `npm run start:prod` — run the compiled app in production mode
- `npm run lint` — lint and auto-fix the codebase with ESLint
- `npm run format` — format the codebase with Prettier
- `npm run test` — run unit tests with Jest
- `npm run test:watch` — run unit tests in watch mode
- `npm run test:cov` — run unit tests with coverage
- `npm run test:debug` — run unit tests with the debugger attached
- `npm run test:e2e` — run end-to-end tests

## Database

The TypeORM connection (see `src/app.module.ts`) is configured with
`synchronize: true`, meaning the database schema is created and updated
automatically from the entity definitions on startup — there are no separate
migration files to run. This is convenient for development, but for a
production deployment you may want to disable `synchronize` and manage schema
changes with explicit TypeORM migrations instead.

## License

MIT — see [LICENSE](LICENSE).

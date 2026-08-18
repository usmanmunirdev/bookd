import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';

process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
});

async function bootstrap() {

  // Disable global body parser
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  app.setGlobalPrefix('api');

  const STRIPE_WEBHOOK_PATH = '/api/subscription/webhook';

  // Get raw Express app
  const expressApp = app.getHttpAdapter().getInstance();

  // ✅ CRITICAL: Apply raw body parser FIRST, before any other body parsers
  expressApp.post(
    STRIPE_WEBHOOK_PATH,
    express.raw({ type: 'application/json' })
  );

  // ✅ Apply JSON parser to all routes EXCEPT webhook
  expressApp.use((req, res, next) => {
    if (req.path === STRIPE_WEBHOOK_PATH) {
      return next();
    }
    express.json()(req, res, next);
  });

  // ✅ Apply URL-encoded parser to all routes EXCEPT webhook
  expressApp.use((req, res, next) => {
    if (req.path === STRIPE_WEBHOOK_PATH) {
      return next();
    }
    express.urlencoded({ extended: true })(req, res, next);
  });

  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(
    '/uploads/profile',
    express.static(join(process.cwd(), 'public/uploads/profile')),
  );

  // Serve admin static files at /admin
  const adminPath = join(process.cwd(), 'admin-build');
  if (fs.existsSync(join(adminPath, 'index.html'))) {
    app.use('/admin', express.static(adminPath));
  }

  // Serve frontend static files
  const frontendPath = join(process.cwd(), 'build');
  if (fs.existsSync(join(frontendPath, 'index.html'))) {
    app.use(express.static(frontendPath));
  }

  // Admin SPA fallback using regex
  if (fs.existsSync(join(adminPath, 'index.html'))) {
    expressApp.get(/^\/admin(?:\/.*)?$/, (req, res) => {
      res.sendFile(join(adminPath, 'index.html'));
    });
  }

  // Frontend SPA fallback - catches everything else (excluding API routes)
  if (fs.existsSync(join(frontendPath, 'index.html'))) {
    expressApp.get(/^(?!\/api|\/uploads|\/stripe|\/admin).*/, (req, res) => {
      res.sendFile(join(frontendPath, 'index.html'));
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
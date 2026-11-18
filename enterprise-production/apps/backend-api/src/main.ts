import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('RoyalCinemaBootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Global API Route Prefix
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Global Input Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // OPENAPI / SWAGGER DOCUMENTATION SPECIFICATION
  // ═══════════════════════════════════════════════════════════════════════════
  const config = new DocumentBuilder()
    .setTitle('Royal Cinema ERP & Multi-Station POS Cloud API')
    .setDescription(
      'Enterprise REST API powering Multi-Tenant Cinema Client Management, Box Office POS, Concession POS, Live Auditoriums, and AWS Cognito Authentication.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Input your AWS Cognito or ERP Master Admin JWT token',
      },
      'JWT-Auth',
    )
    .addTag('Authentication', 'Unified Login, AWS Cognito tokens, and session refresh')
    .addTag('Tenants (Cinema Clients)', 'Super Admin multi-company onboarding and subscription ledger')
    .addTag('Staff Users', 'Cinema owner staff management (Box Office & Food Counter)')
    .addTag('Bookings & Admissions', 'Theatrical seat reservations, POS thermal ticketing, and PNG generation')
    .addTag('Concessions & F&B', 'Food counter sales, inventory stock deduction, and 5% GST')
    .addTag('Payments', 'Razorpay & Stripe payment order creation and webhook verification')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Royal Cinema ERP — OpenAPI Swagger Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a1616; }',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 Royal Cinema Enterprise API is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 OpenAPI Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();

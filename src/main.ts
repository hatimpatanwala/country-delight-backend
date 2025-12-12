import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Country Delight API')
    .setDescription('Country Delight Clone - Milk & Grocery Delivery Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health', 'Health check and monitoring endpoints')
    .addTag('Authentication', 'Authentication endpoints for customers, delivery boys, and admins')
    .addTag('Admin', 'Admin-only endpoints for managing users and system')
    .addTag('Users', 'User profile management endpoints')
    .addTag('Categories', 'Product categories management')
    .addTag('Products', 'Products management and listing')
    .addTag('Cart', 'Shopping cart operations')
    .addTag('Subscriptions', 'Subscription plans and user subscriptions')
    .addTag('Orders', 'Order management and tracking')
    .addTag('Addresses', 'Delivery address management')
    .addTag('Delivery', 'Delivery boy operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Country Delight Backend running on: http://localhost:${port}`);
  console.log(`📚 API available at: http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.use('/storage', express.static(join(process.cwd(), 'storage')));

  app.use(cookieParser());

  app.enableCors({
    origin: (origin, callback) => {
      const allowed = [process.env.FRONTEND_URL || 'http://localhost:4200'];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Origin not allowed:', origin, allowed);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Pet Expense Tracker API')
      .setDescription('API documentation for pet expense tracking')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();

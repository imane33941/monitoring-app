import { MikroORM } from '@mikro-orm/better-sqlite';
import { NestFactory } from '@nestjs/core';
import { mkdirSync } from 'node:fs';
import 'reflect-metadata';
import { AppModule } from './app.module';

async function bootstrap() {
  mkdirSync('./data', { recursive: true });

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  app.enableCors({ origin: 'http://localhost:5174' });

  const orm = app.get(MikroORM);
  await orm.getSchemaGenerator().ensureDatabase();
  await orm.getSchemaGenerator().updateSchema();

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(
    `\n🟢 Monitoring server → http://localhost:${port}/api/monitors\n`,
  );
}

bootstrap();

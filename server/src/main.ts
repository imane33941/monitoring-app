import { MikroORM } from '@mikro-orm/better-sqlite';
import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  app.enableCors({ origin: '*' });

  // Crée les tables SQLite au démarrage
  const orm = app.get(MikroORM);
  await orm.schema.ensureDatabase();
  await orm.schema.updateSchema();

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(
    `\n🟢 Monitoring server → http://localhost:${port}/api/monitors\n`,
  );
}

bootstrap();

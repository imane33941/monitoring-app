import { BetterSqliteDriver } from '@mikro-orm/better-sqlite';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MonitorModule } from './modules/monitors/monitor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MikroOrmModule.forRoot({
      driver: BetterSqliteDriver,
      dbName: './data/monitoring.db',
      entities: ['./dist/modules/**/*.entity.js'],
      entitiesTs: ['./src/modules/**/*.entity.ts'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/(.*)'],
    }),
    MonitorModule,
  ],
})
export class AppModule {}

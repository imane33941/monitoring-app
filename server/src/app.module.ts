import { BetterSqliteDriver } from '@mikro-orm/better-sqlite';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MonitorEntity } from './modules/monitors/monitor.entity';
import { MonitorModule } from './modules/monitors/monitor.module';
import { PingResultEntity } from './modules/monitors/ping-result.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MikroOrmModule.forRoot({
      driver: BetterSqliteDriver,
      dbName: '/tmp/monitoring.db',
      entities: [MonitorEntity, PingResultEntity],
      entitiesTs: [MonitorEntity, PingResultEntity],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
    }),
    MonitorModule,
  ],
})
export class AppModule {}

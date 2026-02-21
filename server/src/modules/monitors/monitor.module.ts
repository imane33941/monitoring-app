import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { MonitorEntity } from "./monitor.entity";
import { PingResultEntity } from "./ping-result.entity";
import { MonitorService } from "./monitor.service";
import { MonitorController } from "./monitor.controller";
import { AlertModule } from "../alerts/alert.module";

@Module({
  imports: [
    MikroOrmModule.forFeature([MonitorEntity, PingResultEntity]),
    AlertModule,
  ],
  providers: [MonitorService],
  controllers: [MonitorController],
})
export class MonitorModule {}

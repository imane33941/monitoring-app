import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { v4 as uuidv4 } from "uuid";
import { MonitorEntity } from "./monitor.entity";

@Entity({ tableName: "ping_results" })
export class PingResultEntity {
  @PrimaryKey()
  id: string = uuidv4();

  @ManyToOne(() => MonitorEntity, { fieldName: "monitor_id" })
  monitor: MonitorEntity;

  @Property()
  status: "up" | "down";

  @Property({ nullable: true })
  statusCode?: number;

  @Property({ nullable: true })
  latencyMs?: number;

  @Property({ nullable: true })
  errorMessage?: string;

  @Property({ onCreate: () => new Date() })
  checkedAt: Date = new Date();
}

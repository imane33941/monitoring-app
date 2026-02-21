import { Entity, PrimaryKey, Property, OneToMany, Collection } from "@mikro-orm/core";
import { v4 as uuidv4 } from "uuid";
import { PingResultEntity } from "./ping-result.entity";

@Entity({ tableName: "monitors" })
export class MonitorEntity {
  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  name: string;

  @Property()
  url: string;

  @Property({ default: 60 })
  intervalSeconds: number = 60;

  @Property({ default: "pending" })
  status: "up" | "down" | "pending" = "pending";

  @Property({ nullable: true })
  lastCheckedAt?: Date;

  @Property({ nullable: true })
  lastLatencyMs?: number;

  @Property({ default: true })
  alertEnabled: boolean = true;

  @Property({ nullable: true })
  alertEmail?: string;

  @Property({ default: 0 })
  consecutiveFailures: number = 0;

  @Property({ default: true })
  active: boolean = true;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @OneToMany(() => PingResultEntity, (r) => r.monitor, { orphanRemoval: true })
  results = new Collection<PingResultEntity>(this);
}

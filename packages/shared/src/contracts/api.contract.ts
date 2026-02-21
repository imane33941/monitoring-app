import { initContract } from "@ts-rest/core";
import { monitorContract } from "./monitor.contract";

const c = initContract();

export const apiContract = c.router(
  {
    monitors: monitorContract,
  },
  {
    pathPrefix: "/api",
  },
);

export type ApiContract = typeof apiContract;

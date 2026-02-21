import { initClient } from "@ts-rest/core";
import { apiContract } from "@monitoring/shared";

export const apiClient = initClient(apiContract, {
  baseUrl: "http://localhost:3001",
  baseHeaders: {},
});

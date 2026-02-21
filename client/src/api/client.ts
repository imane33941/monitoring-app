import { initClient } from '@ts-rest/core';
import { apiContract } from '../../../packages/shared/src/contracts/api.contract';

export const apiClient = initClient(apiContract, {
  baseUrl: 'http://localhost:3001',
  baseHeaders: {},
});

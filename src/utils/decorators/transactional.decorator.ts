import { SetMetadata } from '@nestjs/common';

export const TRANSACTIONAL_KEY = 'transactional';

export interface TransactionConfig {
  rollbackMethod: string;
}

export const Transactional = (config: TransactionConfig) =>
  SetMetadata(TRANSACTIONAL_KEY, config);

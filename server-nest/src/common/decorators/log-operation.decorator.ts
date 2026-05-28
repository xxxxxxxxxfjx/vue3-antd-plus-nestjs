import { SetMetadata } from '@nestjs/common';

export const LOG_OPERATION_KEY = 'logOperation';

export interface LogOperationOptions {
  module: string;
  action: string;
  description?: string;
}

export const LogOperation = (options: LogOperationOptions) =>
  SetMetadata(LOG_OPERATION_KEY, options);

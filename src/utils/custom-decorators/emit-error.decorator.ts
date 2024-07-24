import { SetMetadata } from '@nestjs/common';

export const EMIT_ERROR_KEY = 'emitError';
export const EmitError = SetMetadata(EMIT_ERROR_KEY, true);

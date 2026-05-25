import { SetMetadata } from '@nestjs/common';
import { RESPONSE_MESSAGE_KEY, SKIP_RESPONSE_FORMAT_KEY } from './interceptor';

export const ResponseMessage = (message: string) => SetMetadata(RESPONSE_MESSAGE_KEY, message);
export const SkipResponseFormat = () => SetMetadata(SKIP_RESPONSE_FORMAT_KEY, true);

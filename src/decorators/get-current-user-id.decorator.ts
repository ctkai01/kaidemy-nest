import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUserID = createParamDecorator(
  (data: undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
 
    if (request.user) {
      return request.user['sub'];
    }
    return null;
  },
);

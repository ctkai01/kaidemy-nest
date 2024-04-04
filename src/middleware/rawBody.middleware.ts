import { Response } from 'express';
import { json } from 'body-parser';


import { Request } from 'express';

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

function rawBodyMiddleware() {
  return json({
    verify: (
      request: RequestWithRawBody,
      response: Response,
      buffer: Buffer,
    ) => {
      console.log('request.url : ', request.url);
      if (request.url === '/api/stripe/webhook' && Buffer.isBuffer(buffer)) {
        request.rawBody = Buffer.from(buffer);
      }
      console.log('request : ', request);

      return true;
    },
  });
}

export default rawBodyMiddleware;

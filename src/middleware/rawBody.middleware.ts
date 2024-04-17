import { Response } from 'express';
import { json } from 'body-parser';

<<<<<<< HEAD

=======
>>>>>>> 5f9e6fc87e73f5086ec899343fe212165a602d63
import { Request } from 'express';

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}
<<<<<<< HEAD

=======
 
>>>>>>> 5f9e6fc87e73f5086ec899343fe212165a602d63
function rawBodyMiddleware() {
  return json({
    verify: (
      request: RequestWithRawBody,
      response: Response,
      buffer: Buffer,
    ) => {
<<<<<<< HEAD
      console.log('request.url : ', request.url);
      if (request.url === '/api/stripe/webhook' && Buffer.isBuffer(buffer)) {
        request.rawBody = Buffer.from(buffer);
      }
      console.log('request : ', request);

=======
      if (request.url === '/api/stripe/webhook' && Buffer.isBuffer(buffer)) {
        request.rawBody = Buffer.from(buffer);
      }
>>>>>>> 5f9e6fc87e73f5086ec899343fe212165a602d63
      return true;
    },
  });
}

export default rawBodyMiddleware;

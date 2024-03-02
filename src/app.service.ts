import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino'
@Injectable()
export class AppService {
  //  constructor(private readonly logger: Logger) {}
  getHello(): string {
    //  this.logger.log('something')
    return 'Hello World!';
  }
}

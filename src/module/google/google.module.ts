import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleAuthenticationService } from './google.service';

@Module({
//   imports: [ConfigModule],
  providers: [GoogleAuthenticationService],
  exports: [GoogleAuthenticationService],
})
export class GoogleModule {}

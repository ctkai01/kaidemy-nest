import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { QueueModule } from '../queues/queue.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from 'src/strategy/google.strategy';
import { GoogleModule } from '../google/google.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    // UserModule,
    JwtModule.register({}),
    // PassportModule.register({ defaultStrategy: 'google' }),
    QueueModule,
    GoogleModule,
    forwardRef(() => UserModule),
  ],
  providers: [AuthService, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

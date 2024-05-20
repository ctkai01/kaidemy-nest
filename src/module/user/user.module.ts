import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UploadModule } from '../upload/upload.module';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { StripeModule } from '@golevelup/nestjs-stripe';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { Course, Learning } from 'src/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Learning, Course]),
    ConfigModule,
    JwtModule.register({}),
    UploadModule,
    StripeModule.forRootAsync(StripeModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          apiKey: configService.get('STRIPE_KEY'),
        };
      },
    }),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, UserRepository],
  // providers: [UserService, UserRepository, AuthService],
  controllers: [UserController],
  exports: [UserService, UserRepository],
})
export class UserModule {}

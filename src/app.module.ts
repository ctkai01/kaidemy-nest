import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthGuard } from './guards/auth.guard';
import { AuthModule } from './module/auth/auth.module';
import { EmailModule } from './module/email/email.module';
import { UploadService } from './module/upload/upload.service';
import { UploadModule } from './module/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      isGlobal: true,
    }),
    JwtModule.register({}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // connectionFactory: async (options?: ConnectionOptions): Promise<Connection> => {
      //   return {
      //     then(onfulfilled?, onrejected?) {
      //       // onfulfilled(
      //       //   getConnection()
      //       // })
      //       onrejected((value: any) => {
      //         console.log('Value', value)
      //         getConnection(options.synchronize).connect()
      //       })
      //     },
      //   }
      // }
      // ,
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'mysql',
          autoLoadEntities: true,
          synchronize: true,
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          logging: true,
          keepConnectionAlive: true,
          extra: { insecureAuth: true },
          entities: [User],
          timezone: 'Asia/Ho_Chi_Minh',
        };
      },
    }),
    AuthModule,
    EmailModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: 'CONFIG_APP',
      useValue: new ConfigService(),
    },
    UploadService,
  ],
})
export class AppModule {}


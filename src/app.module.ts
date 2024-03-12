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
import { UserModule } from './module/user/user.module';
import { LevelModule } from './module/level/level.module';
import { PriceModule } from './module/price/price.module';
import { CategoryModule } from './module/category/category.module';
import { Category, Level, Price } from './entities';

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
          extra: { insecureAuth: true, charset: 'utf8mb4_unicode_ci' },
          entities: [User, Price, Level, Category],
          timezone: '+07:00',
        };
      },
    }),
    AuthModule,
    EmailModule,
    UploadModule,
    PriceModule,
    LevelModule,
    CategoryModule,
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

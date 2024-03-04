import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { flatMap } from 'rxjs';

require('dotenv').config();
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        console.log(configService.get('SMTP_HOST'))
        return {
          transport: {
            service: 'QueueTest',
            host: configService.get('SMTP_HOST'),
            port: configService.get('SMTP_PORT'),
            auth: {
              user: configService.get('SMTP_USER'),
              pass: configService.get('SMTP_PASSWORD'),
            },
          },
          defaults: {
            from: configService.get('FROM_EMAIL'),
          },
          template: {
            dir: __dirname + '/templates',
            // dir: __dirname + '/src/templates',
            adapter: new HandlebarsAdapter(), // Use Handlebars for templating
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

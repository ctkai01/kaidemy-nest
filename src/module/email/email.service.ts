import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailForgot } from 'src/interface';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}
  async sendEmailForgotPassword(options: MailForgot) {
    console.log('options.urlRedirect', options.urlRedirect);
    try {
      const message = {
        to: options.email,
        subject: 'Reset Password',
      };
      const emailSend = await this.mailerService.sendMail({
        ...message,
        template: 'forgot-password',
        context: {
          fullName: options.fullName,
          urlRedirect: options.urlRedirect,
        },
      });
      return emailSend;
    } catch (error) {
      console.log('Error: ', error);
      throw new Error('Email send failed:'); 
    }
  }
}

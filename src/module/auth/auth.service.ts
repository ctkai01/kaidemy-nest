import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as bcrypt from 'bcryptjs';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ACCOUNT_GOOGLE, ACCOUNT_NORMAL, DEFAULT_ROLE } from 'src/constants';
import { User } from 'src/entities/user.entity';
import { MailForgot } from 'src/interface';
import { JWTPayload } from 'src/interface/jwt.payload';
import { hashData } from 'src/utils';
import { getRepository } from 'typeorm';
import { ResponseData } from '../../interface/response.interface';
import { UserLogin, UserRegister } from '../../response';
import { GoogleAuthenticationService } from '../google/google.service';
import { ProducerService } from '../queues/producer.service';
import { UserRepository } from '../user/user.repository';
import {
  CreateUserDto,
  ForgotPasswordDto,
  LoginUserDto,
  ResetPasswordDto,
} from './dto';
import { LoginGoogleDto } from './dto/login-google-dto';
import { EmailTokenPayload } from './interface/email-token.interface';
import { Tokens } from './interface/token.interface';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private config: ConfigService,
    private jwtService: JwtService,
    private producerService: ProducerService,
    private googleAuthenticationService: GoogleAuthenticationService,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<ResponseData> {
    const { email, name, password } = createUserDto;
    const hashPassword = await hashData(createUserDto.password);

    const data: User = {
      email,
      password: hashPassword,
      name,
      role: DEFAULT_ROLE,
      typeAccount: ACCOUNT_NORMAL,
    };

    const user = await this.userRepository.createUser(data);

    const tokens = await this.getTokens(user.id, user.email);

    const useRegisterData: UserRegister = {
      token: tokens.access_token,
      user: user,
    };

    const responseData: ResponseData = {
      data: useRegisterData,
      message: 'Create user successfully!',
    };

    return responseData;
  }

  async loginGoogle(loginGoogleDto: LoginGoogleDto): Promise<ResponseData> {
    const { token } = loginGoogleDto;
    try {
      const dataInfo =
        await this.googleAuthenticationService.authenticate(token);

      let user = await this.userRepository.getByEmail(dataInfo.email);

      if (!user) {
        user = {
          email: dataInfo.email,
          name: dataInfo.name,
          typeAccount: ACCOUNT_GOOGLE,
          password: '',
          role: DEFAULT_ROLE,
        };

        await this.userRepository.save(user);
      } else {
        if (user.isBlock) {
          throw new ForbiddenException('user being blocked');
        }

        if (user.typeAccount !== ACCOUNT_GOOGLE) {
          throw new InternalServerErrorException('user not has account google');
        }
      }

      const tokens = await this.getTokens(user.id, user.email);

      const useRegisterData: UserRegister = {
        token: tokens.access_token,
        user: user,
      };

      const responseData: ResponseData = {
        data: useRegisterData,
        message: 'Login google user successfully!',
      };

      return responseData;
    } catch (err) {
      throw new InternalServerErrorException('Login google failed');
    }
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<ResponseData> {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.getByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.isBlock) {
      throw new ForbiddenException('user being blocked');
    }

    // Check password whether valid or no ?
    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException();
    }

    const tokens = await this.getTokens(user.id, user.email);

    const useRegisterData: UserLogin = {
      token: tokens.access_token,
      user: user,
    };

    const responseData: ResponseData = {
      data: useRegisterData,
      message: 'Login successfully!',
    };

    return responseData;
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ResponseData> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.getByEmail(email);

    if (!user) {
      const responseData: ResponseData = {
        message: 'Forgot successfully!',
      };

      return responseData;
    }

    if (user.typeAccount != ACCOUNT_NORMAL) {
      throw new BadRequestException(
        'Forgot password only available for normal account',
      );
    }

    // Spawn email token by JWT
    const emailToken = await this.encodeJWTEmail(email);

    user.emailToken = emailToken;

    await this.userRepository.updateData(user);

    // Send email
    const emailData: MailForgot = {
      email: user.email,
      fullName: user.name,
      urlRedirect:
        this.config.get('HOST_RESET_EMAIl_FE') + `/?email=${emailToken}`,
    };
    console.log('emailData: ', emailData);
    console.log('emailData1: ', this.config.get('HOST_RESET_EMAIl_FE'));
    await this.producerService.addToEmailQueue(emailData);

    const responseData: ResponseData = {
      message: 'Forgot successfully!',
    };

    return responseData;
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ResponseData> {
    const { emailToken, password } = resetPasswordDto;

    const user = await this.userRepository.getByEmailToken(emailToken);

    if (!user) {
      throw new BadRequestException('Email token invalid');
    }

    if (user.typeAccount != ACCOUNT_NORMAL) {
      throw new BadRequestException(
        'Reset password only available for normal account',
      );
    }

    // Verify email token
    const token = await this.decodeJWTEmail(emailToken);
    this.logger.log(token);
    if (!token) {
      throw new BadRequestException('Email token invalid');
    }

    // Hash new password
    const passwordHash = await hashData(password);

    user.password = passwordHash;
    user.emailToken = null;

    await this.userRepository.updateData(user);

    const responseData: ResponseData = {
      message: 'Reset successfully!',
    };

    return responseData;
  }

  async encodeJWTEmail(email: string): Promise<string> {
    const HOUR_SECONDS = 60 * 60;

    const token = await this.jwtService.signAsync(
      {
        sub: email,
      },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: HOUR_SECONDS,
      },
    );

    return token;
  }

  async decodeJWTEmail(emailToken: string): Promise<EmailTokenPayload | null> {
    try {
      const data = await this.jwtService.verifyAsync(emailToken, {
        secret: this.config.get('JWT_SECRET'),
      });

      return data;
    } catch (err) {
      console.log('Err: ', err);
      return null;
    }
  }

  async getTokens(userID: number, email: string): Promise<Tokens> {
    const DAY_SECONDS = 60 * 60 * 24;
    const token = await this.jwtService.signAsync(
      {
        sub: userID,
        email,
      },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: DAY_SECONDS,
      },
    );

    return {
      access_token: token,
    };
  }

  // async updateRtHash(userId: number, rf: string): Promise<void> {
  //   const hashRf = await this.hashData(rf);
  //   const user = await this.userRepository.findOne({
  //     where: [{ id: userId }],
  //   });
  //   user.refresh_token = hashRf;

  //   await this.userRepository.save(user);
  // }

  // async getAllUser(): Promise<User[]> {
  //   const users = await this.userRepository.find()
  //   return users
  // }

  // async deleteUser(idUser: number): Promise<void> {
  //   const user = await this.userRepository.findOne({
  //     where: [{ id: idUser }],
  //   });
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //   const result = await this.userRepository.remove(user)
  // }

  getJwtUser(jwt: string): Observable<Promise<User> | null> {
    return from(
      this.jwtService.verifyAsync(jwt, {
        secret: this.config.get('JWT_SECRET'),
      }),
    ).pipe(
      map(async (payload: JWTPayload) => {
        const useAuth = await getRepository(User).findOne({
          where: [{ id: payload.sub }],
        });
        return useAuth;
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }
}

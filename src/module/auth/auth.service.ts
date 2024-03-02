import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ACCOUNT_NORMAL, DEFAULT_ROLE } from 'src/constants';
import { User } from 'src/entities/user.entity';
import { JWTPayload } from 'src/interface/jwt.payload';
import { hashData } from 'src/utils';
import { getRepository } from 'typeorm';
import { ResponseData } from '../../interface/response.interface';
import { UserLogin, UserRegister } from '../../response';
import { UserRepository } from '../user/user.repository';
import { CreateUserDto, ForgotPasswordDto, LoginUserDto } from './dto';
import { Tokens } from './interface/token.interface';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private config: ConfigService,
    private jwtService: JwtService,
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

  async loginUser(loginUserDto: LoginUserDto): Promise<ResponseData> {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.getByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
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
    const emailToken = await this.encodeJWTEmail(email)

    user.emailToken = emailToken
    
    await this.userRepository.updateData(user);


    const responseData: ResponseData = {
      message: 'Forgot successfully!',
    };

    return responseData;
  }

  async encodeJWTEmail(email: string): Promise<string> {
    const HOUR_SECONDS = 60 * 24;
    const token = await this.jwtService.signAsync(
      {
        sub: email,
      },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: HOUR_SECONDS,
      },
    );

    return token
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

import {
  BadRequestException, forwardRef, Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from 'src/entities/user.entity';
import { JWTPayload } from 'src/interface/jwt.payload';
// import { UserLoginResource } from 'src/resource/user/user-login.resource';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import * as bcrypt from 'bcryptjs';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { PageDto } from 'src/common/paginate/paginate.dto';
import {
  ACCOUNT_STRIPE_PENDING,
  ACCOUNT_STRIPE_VERIFY,
  NORMAL_USER,
  TEACHER,
  UploadResource
} from 'src/constants';
import { UserLogin } from 'src/response';
import { generateHashKey, hashData } from 'src/utils';
import Stripe from 'stripe';
import { getRepository } from 'typeorm';
import { ResponseData } from '../../interface/response.interface';
import { AuthService } from '../auth/auth.service';
import { UploadService } from '../upload/upload.service';
import { BlockUserDto } from './dto/block-user-dto';
import { ChangePasswordDto } from './dto/create-user-dto';
import { GetUserDto } from './dto/get-user-dto';
import { UpdateProfileDto } from './dto/update-user-dto';
import { VerifyTeacherDto } from './dto/verify-teacher-dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  constructor(
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly userRepository: UserRepository,
    private config: ConfigService,
    private jwtService: JwtService,
    private readonly uploadService: UploadService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}
  async changePassword(
    changePasswordDto: ChangePasswordDto,
    userID: number,
  ): Promise<ResponseData> {
    const { old_password, new_password } = changePasswordDto;
    const user = await this.userRepository.getByID(userID);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isCorrectPassword = await bcrypt.compare(old_password, user.password);

    if (!isCorrectPassword) {
      throw new InternalServerErrorException('Old password incorrect');
    }

    const newHashPassword = await hashData(new_password);
    this.logger.log(`isCorrectPassword: ${isCorrectPassword}`);
    user.password = newHashPassword;
    await this.userRepository.updateData(user);

    const responseData: ResponseData = {
      message: 'Change password successfully!',
    };

    return responseData;
  }

  async profileByMe(userID: number): Promise<ResponseData> {
    const user = await this.userRepository.getByID(userID);

    if (!user) {
      throw new UnauthorizedException();
    }

    const responseData: ResponseData = {
      message: 'Get profile successfully!',
      data: user,
    };

    return responseData;
  }

  async blockUser(
    userID: number,
    blockUserDto: BlockUserDto,
  ): Promise<ResponseData> {
    const user = await this.userRepository.getByID(userID);

    if (!user) {
      throw new NotFoundException();
    }

    user.isBlock = blockUserDto.isBlock;

    await this.userRepository.updateData(user);

    const responseData: ResponseData = {
      message: 'Block user successfully!',
    };

    return responseData;
  }

  async getUsers(getUserDto: GetUserDto): Promise<ResponseData> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder.orderBy('user.created_at', getUserDto.order);

    if (getUserDto.search) {
      queryBuilder.andWhere('user.name LIKE :searchQuery', {
        searchQuery: `%${getUserDto.search}%`,
      });
    }
    queryBuilder.skip(getUserDto.skip).take(getUserDto.size);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: getUserDto,
    });
    const data = new PageDto(entities, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get users successfully!',
      data,
    };
    return responseData;
  }

  async getUserByID(userID: number): Promise<ResponseData> {
    const user = await this.userRepository.findOne({
      where: [{ id: userID }],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const responseData: ResponseData = {
      message: 'Get user successfully!',
      data: user,
    };
    return responseData;
  }

  async updateProfile(
    userID: number,
    updateProfileDto: UpdateProfileDto,
    avatar: Express.Multer.File,
  ): Promise<ResponseData> {
    const user = await this.userRepository.getByID(userID);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (avatar) {
      // Remove avatar previous
      if (user.avatar) {
        await this.uploadService.deleteResource(user.avatar);
      }

      const avatarURL = await this.uploadService.uploadResource(
        avatar,
        UploadResource.Avatar,
      );
      user.avatar = avatarURL;
    }

    user.name = updateProfileDto.name;

    user.biography = updateProfileDto.biography
      ? updateProfileDto.biography
      : null;
    user.headline = updateProfileDto.headline
      ? updateProfileDto.headline
      : null;
    user.linkedInURL = updateProfileDto.linkedInURL
      ? updateProfileDto.linkedInURL
      : null;
    user.twitterURL = updateProfileDto.twitterURL
      ? updateProfileDto.twitterURL
      : null;
    user.websiteURL = updateProfileDto.websiteURL
      ? updateProfileDto.websiteURL
      : null;
    user.youtubeURL = updateProfileDto.youtubeURL
      ? updateProfileDto.youtubeURL
      : null;

    user.facebookURL = updateProfileDto.facebookURL
      ? updateProfileDto.facebookURL
      : null;

    this.userRepository.save(user);

    const responseData: ResponseData = {
      message: 'Update profile successfully!',
      data: user,
    };

    return responseData;
  }

  async requestTeacher(userID: number): Promise<ResponseData> {
    const user = await this.userRepository.findOne({
      where: [{ id: userID }],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== NORMAL_USER) {
      throw new BadRequestException('Only for normal user');
    }

    if (user.accountStripeStatus === ACCOUNT_STRIPE_VERIFY) {
      throw new BadRequestException('Already teacher');
    }

    try {
      const account = await this.stripeClient.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
      });
      const key = generateHashKey();
      const accountLink = await this.stripeClient.accountLinks.create({
        account: account.id,
        refresh_url: `http://localhost:5173/register-teacher?refresh_url=true`,
        return_url: `http://localhost:5173/register-teacher?return_url=true&key=${key}`,
        type: 'account_onboarding',
      });

      user.keyAccountStripe = key;
      user.accountStripeID = account.id;
      user.accountStripeStatus = ACCOUNT_STRIPE_PENDING;

      this.userRepository.save(user);

      const linkResponse = {
        link: accountLink.url,
      };
      const responseData: ResponseData = {
        message: 'Request register teacher successfully!',
        data: linkResponse,
      };
      return responseData;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create Stripe account: ' + error.message,
      );
    }
  }

  async verifyTeacher(
    userID: number,
    verifyTeacherDto: VerifyTeacherDto,
  ): Promise<ResponseData> {
    const { key } = verifyTeacherDto;
    const user = await this.userRepository.findOne({
      where: [{ id: userID }],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== NORMAL_USER) {
      throw new BadRequestException('Only for normal user');
    }

    if (user.accountStripeStatus === ACCOUNT_STRIPE_VERIFY) {
      throw new BadRequestException('Already teacher');
    }

    if (user.keyAccountStripe !== key) {
      throw new BadRequestException('Key verify incorrect');
    }

    user.keyAccountStripe = '';
    user.role = TEACHER;
    user.accountStripeStatus = ACCOUNT_STRIPE_VERIFY;

    this.userRepository.save(user);

    const tokens = await this.authService.getTokens(user.id, user.email);
    const useLoginData: UserLogin = {
      token: tokens.access_token,
      user: user,
    };
    const responseData: ResponseData = {
      message: 'Verify register teacher successfully!',
      data: useLoginData,
    };
    return responseData;
  }

  // async login(loginUserDto: LoginUserDto) {
  //   const { account, password } = loginUserDto;
  //   const user = await this.userRepository.findOne({
  //     where: [{ user_name: account }, { phone: account }, { email: account }],
  //   });
  //   let checkPass = false;
  //   if (user) {
  //     checkPass = bcrypt.compareSync(password, user.password);
  //   }

  //   if (user && checkPass) {
  //     const tokens = await this.getTokens(user.id, user.user_name);
  //     await this.updateRtHash(user.id, tokens.refresh_token);
  //     const responseData: ResponseData = {
  //       data: {
  //         user: await UserLoginResource(user, user),
  //         tokens,
  //       },
  //       message: 'Login Successfully!',
  //     };
  //     return responseData;
  //   } else {
  //     throw new UnauthorizedException('Please check your login credentials');
  //   }
  // }

  // async logout(userId: number) {
  //   const user = await this.userRepository.findOne({
  //     where: [{ id: userId }],
  //   });
  //   console.log("Reset Token", user)
  //   user.refresh_token = null;

  //   await this.userRepository.save(user);
  // }

  // async refreshToken(userId: number, rf: string) {
  //   const user = await this.userRepository.findOne({
  //     where: [{ id: userId }],
  //   });
  //   console.log("RF: ", rf)
  //   console.log("RF 2: ", user.refresh_token)
  //   if (user && bcrypt.compare(rf, user.refresh_token)) {
  //     const tokens = this.getTokens(userId, user.user_name);
  //     await this.updateRtHash(userId, (await tokens).refresh_token);
  //     return tokens;
  //   } else {
  //     throw new UnauthorizedException('Please check your login credentials');
  //   }
  // }

  // async hashData(data: string): Promise<string> {
  //   const hashData = bcrypt.hashSync(data, 8);
  //   return hashData;
  // }

  // async getTokens(userID: number, email: string): Promise<Tokens> {
  //   const DAY_SECONDS = 60 * 60 * 24;
  //   const token = await this.jwtService.signAsync(
  //     {
  //       sub: userID,
  //       email,
  //     },
  //     {
  //       secret: this.config.get('JWT_SECRET'),
  //       expiresIn: DAY_SECONDS,
  //     },
  //   );

  //   return {
  //     access_token: token,
  //   };
  // }

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
    // console.log(jwt)
    // console.log('FFF', this.jwtService.verifyAsync(jwt, {
    //   secret: this.config.get('JWT_SECRET')
    // }))
    return from(
      this.jwtService.verifyAsync(jwt, {
        secret: this.config.get('JWT_SECRET'),
      }),
    ).pipe(
      map(async (payload: JWTPayload) => {
        const useAuth = await getRepository(User).findOne({
          where: [{ id: payload.sub }],
        });
        // console.log('FUCK YOU',user)
        return useAuth;
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }

  // async getJwtUser(jwt: string): Promise<User | undefined> {
  //   console.log('154',jwt)
  //   return  await this.jwtService.verifyAsync(jwt, {
  //     secret: this.config.get('JWT_SECRET')
  //   })

  // }
}

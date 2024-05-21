import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
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
  AuthorStatistic,
  CourseStatus,
  CourseUtil,
  NORMAL_USER,
  TEACHER,
  UploadResource,
} from 'src/constants';
import { UserLogin } from 'src/response';
import { generateHashKey, hashData } from 'src/utils';
import Stripe from 'stripe';
import { getRepository, Repository } from 'typeorm';
import { ResponseData } from '../../interface/response.interface';
import { AuthService } from '../auth/auth.service';
import { UploadService } from '../upload/upload.service';
import { BlockUserDto } from './dto/block-user-dto';
import { ChangePasswordDto } from './dto/create-user-dto';
import { GetUserDto } from './dto/get-user-dto';
import { UpdateProfileDto } from './dto/update-user-dto';
import { VerifyTeacherDto } from './dto/verify-teacher-dto';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Course, Learning } from 'src/entities';

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
    @InjectRepository(Learning)
    private readonly learningRepository: Repository<Learning>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
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
      queryBuilder.andWhere('UPPER(user.name) LIKE UPPER(:searchQuery)', {
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

  async getInstructorStat(userID: number): Promise<ResponseData> {
    const user = await this.userRepository.findOne({
      where: [{ id: userID }],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== TEACHER) {
      throw new BadRequestException('User is not a teacher');
    }

    let courses = await this.courseRepository
      .createQueryBuilder('courses')
      .select('courses.id')
      .where('courses.userID = :userID', {
        userID,
      })
      .andWhere('courses.reviewStatus = :reviewStatus', {
        reviewStatus: CourseStatus.REVIEW_VERIFY,
      })
      .leftJoinAndSelect(
        'courses.learnings',
        'learnings',
        'learnings.type IN (:...types)',
      )
      .setParameter('types', [CourseUtil.STANDARD_TYPE, CourseUtil.ARCHIE])
      .getMany();

    const courseIDs = courses.map((course) => course.id);

    let totalReviewCountStar: number = 0;
    let totalReviewCount: number = 0;
    let totalStudent: number = 0;

    courses.forEach((course) => {
      course.learnings.forEach((learning) => {
        if (learning.starCount) {
          totalReviewCountStar += learning.starCount;
          totalReviewCount++;
        }
        totalStudent++;
      });
    });

    let averageReview: number;
    if (totalReviewCount) {
      averageReview = totalReviewCountStar / totalReviewCount;
      averageReview = parseFloat(averageReview.toFixed(2));
    }

    const data: AuthorStatistic = {
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        biography: user.biography,
      },
      averageReview,
      countReview: totalReviewCount,
      countStudent: totalStudent,
      totalCourse: courses.length,
    };
    const responseData: ResponseData = {
      message: 'Get instructor stat successfully!',
      data,
    };
    return responseData;
  }

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

import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
import { PageDto } from 'src/common/paginate/paginate.dto';
import { IssueType } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CreateIssueTypeDto, UpdateIssueTypeDto } from './dto';
import { IssueTypeRepository } from './issue-type.repository';

@Injectable()
export class IssueTypeService {
  private logger = new Logger(IssueTypeService.name);
  constructor(private readonly issueTypeRepository: IssueTypeRepository) {}
  async createIssueType(
    createIssueTypeDto: CreateIssueTypeDto,
  ): Promise<ResponseData> {
    const { name } = createIssueTypeDto;
    const issueType: IssueType = {
      name,
    };

    const issueTypeCreate =
      await this.issueTypeRepository.createIssueType(issueType);

    const responseData: ResponseData = {
      message: 'Create issue type successfully!',
      data: issueTypeCreate,
    };

    return responseData;
  }

  async updateIssueType(
    updateIssueTypeDto: UpdateIssueTypeDto,
    issueTypeID: number,
  ): Promise<ResponseData> {
    const { name } = updateIssueTypeDto;

    const issueType =
      await this.issueTypeRepository.getIssueTypeById(issueTypeID);

    if (!issueType) {
      throw new NotFoundException('Issue type not found');
    }

    if (name) {
      const issueTypeByName =
        await this.issueTypeRepository.getIssueTypeByName(name);

      if (issueTypeByName && issueTypeByName.id !== issueTypeID) {
        throw new ConflictException('Name already exists');
      }
      issueType.name = name;
    }


    await this.issueTypeRepository.save(issueType);
    const responseData: ResponseData = {
      message: 'Update issue type successfully!',
      data: issueType,
    };

    return responseData;
  }

  async deleteIssueType(issueTypeID: number): Promise<ResponseData> {
    const issueType = await this.issueTypeRepository.getIssueTypeById(issueTypeID);

    if (!issueType) {
      throw new NotFoundException('Issue type not found');
    }

    await this.issueTypeRepository.delete(issueTypeID);

    const responseData: ResponseData = {
      message: 'Delete issue type successfully!',
    };

    return responseData;
  }

  async getIssueTypes(
    pageCommonOptionsDto: PageCommonOptionsDto,
  ): Promise<ResponseData> {
    const queryBuilder = this.issueTypeRepository.createQueryBuilder('issue_type');
    queryBuilder
      .orderBy('issue_type.created_at', pageCommonOptionsDto.order)

    queryBuilder
      .skip(pageCommonOptionsDto.skip)
      .take(pageCommonOptionsDto.size);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageCommonOptionsDto,
    });
    const data = new PageDto(entities, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get issue types successfully!',
      data,
    };

    return responseData;
  }

  // async profileByMe(userID: number): Promise<ResponseData> {
  //   const user = await this.userRepository.getByID(userID);

  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }

  //   const responseData: ResponseData = {
  //     message: 'Get profile successfully!',
  //     data: user,
  //   };

  //   return responseData;
  // }

  // async blockUser(
  //   userID: number,
  //   blockUserDto: BlockUserDto,
  // ): Promise<ResponseData> {
  //   const user = await this.userRepository.getByID(userID);

  //   if (!user) {
  //     throw new NotFoundException();
  //   }

  //   user.isBlock = blockUserDto.isBlock;

  //   await this.userRepository.updateData(user);

  //   const responseData: ResponseData = {
  //     message: 'Block user successfully!',
  //   };

  //   return responseData;
  // }

  // async getUsers(
  //   pageUserOptionsDto: PageUserOptionsDto,
  // ): Promise<ResponseData> {
  //   const queryBuilder = this.userRepository.createQueryBuilder('user');

  //   queryBuilder.orderBy('user.created_at', pageUserOptionsDto.order);

  //   if (pageUserOptionsDto.search) {
  //     queryBuilder.andWhere('user.name LIKE :searchQuery', {
  //       searchQuery: `%${pageUserOptionsDto.search}%`,
  //     });
  //   }
  //   queryBuilder.skip(pageUserOptionsDto.skip).take(pageUserOptionsDto.size);

  //   const itemCount = await queryBuilder.getCount();
  //   const { entities } = await queryBuilder.getRawAndEntities();

  //   const pageMetaDto = new PageMetaDto({
  //     itemCount,
  //     pageOptionsDto: pageUserOptionsDto,
  //   });
  //   const data = new PageDto(entities, pageMetaDto);

  //   const responseData: ResponseData = {
  //     message: 'Get users successfully!',
  //     data,
  //   };
  //   return responseData;
  // }

  // async getUserByID(userID: number): Promise<ResponseData> {
  //   const user = await this.userRepository.findOne({
  //     where: [{ id: userID }],
  //   });

  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //   const responseData: ResponseData = {
  //     message: 'Get user successfully!',
  //     data: user,
  //   };
  //   return responseData;
  // }

  // async updateProfile(
  //   userID: number,
  //   updateProfileDto: UpdateProfileDto,
  //   avatar: Express.Multer.File,
  // ): Promise<ResponseData> {
  //   const user = await this.userRepository.getByID(userID);

  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }

  //   if (avatar) {
  //     // Remove avatar previous
  //     if (user.avatar) {
  //       await this.uploadService.deleteResource(user.avatar);
  //     }

  //     const avatarURL = await this.uploadService.uploadResource(
  //       avatar,
  //       UploadResource.Avatar,
  //     );
  //     user.avatar = avatarURL;
  //   }

  //   user.name = updateProfileDto.name;

  //   user.biography = updateProfileDto.biography
  //     ? updateProfileDto.biography
  //     : null;
  //   user.headline = updateProfileDto.headline
  //     ? updateProfileDto.headline
  //     : null;
  //   user.linkedInURL = updateProfileDto.linkedInURL
  //     ? updateProfileDto.linkedInURL
  //     : null;
  //   user.twitterURL = updateProfileDto.twitterURL
  //     ? updateProfileDto.twitterURL
  //     : null;
  //   user.websiteURL = updateProfileDto.websiteURL
  //     ? updateProfileDto.websiteURL
  //     : null;
  //   user.youtubeURL = updateProfileDto.youtubeURL
  //     ? updateProfileDto.youtubeURL
  //     : null;

  //   user.facebookURL = updateProfileDto.facebookURL
  //     ? updateProfileDto.facebookURL
  //     : null;

  //   this.userRepository.save(user);

  //   const responseData: ResponseData = {
  //     message: 'Update profile successfully!',
  //     data: user,
  //   };

  //   return responseData;
  // }

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

  // async getJwtUser(jwt: string): Promise<User | undefined> {
  //   console.log('154',jwt)
  //   return  await this.jwtService.verifyAsync(jwt, {
  //     secret: this.config.get('JWT_SECRET')
  //   })

  // }
}

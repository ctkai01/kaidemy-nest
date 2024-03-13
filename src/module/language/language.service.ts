import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
import { PageDto } from 'src/common/paginate/paginate.dto';
import { Language } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CreateLanguageDto, UpdateLanguageDto } from './dto';
import { LanguageRepository } from './language.repository';

@Injectable()
export class LanguageService {
  private logger = new Logger(LanguageService.name);
  constructor(private readonly languageRepository: LanguageRepository) {}
  async createLanguage(
    createLanguageDto: CreateLanguageDto,
  ): Promise<ResponseData> {
    const { name } = createLanguageDto;
    const language: Language = {
      name,
    };

    const languageCreate =
      await this.languageRepository.createLanguage(language);

    const responseData: ResponseData = {
      message: 'Create language successfully!',
      data: languageCreate,
    };

    return responseData;
  }

  async updateLanguage(
    updateLanguageDto: UpdateLanguageDto,
    languageID: number,
  ): Promise<ResponseData> {
    const { name } = updateLanguageDto;

    const language = await this.languageRepository.getLanguageById(languageID);

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    if (name) {
      const languageByName =
        await this.languageRepository.getLanguageByName(name);

      if (languageByName && languageByName.id !== languageID) {
        throw new ConflictException('Name already exists');
      }
      language.name = name;
    }

    await this.languageRepository.save(language);
    const responseData: ResponseData = {
      message: 'Update language successfully!',
      data: language,
    };

    return responseData;
  }

  async deleteLanguage(languageID: number): Promise<ResponseData> {
    const issueType =
      await this.languageRepository.getLanguageById(languageID);

    if (!issueType) {
      throw new NotFoundException('Language not found');
    }

    await this.languageRepository.delete(languageID);

    const responseData: ResponseData = {
      message: 'Delete language successfully!',
    };

    return responseData;
  }

  async getLanguages(
    pageCommonOptionsDto: PageCommonOptionsDto,
  ): Promise<ResponseData> {
    const queryBuilder =
      this.languageRepository.createQueryBuilder('language');
    queryBuilder.orderBy('language.created_at', pageCommonOptionsDto.order);

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
      message: 'Get languages successfully!',
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

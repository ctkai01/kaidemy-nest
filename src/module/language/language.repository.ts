import { ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { IssueType } from '../../entities/issue-type.entity';
import { Language } from 'src/entities';

@EntityRepository(Language)
export class LanguageRepository extends Repository<Language> {
  private logger = new Logger(LanguageRepository.name);

  constructor(
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
  ) {
    super(
      languageRepository.target,
      languageRepository.manager,
      languageRepository.queryRunner,
    );
  }
  async createLanguage(languageData: Language): Promise<Language> {
    try {
      const language = this.create(languageData);
      const languageCreated = await this.save(language);

      return languageCreated;
    } catch (err) {
      this.logger.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Name already exists');
      }

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getLanguageById(languageID: number): Promise<Language> {
    const language = await this.findOne({
      where: {
        id: languageID,
      },
    });
    return language;
  }

  async getLanguageByName(name: string): Promise<Language> {
    const language = await this.findOne({
      where: {
        name,
      },
    });
    return language;
  }

  // async getUserByUserName(userName: string): Promise<User> {
  //   const user = (await this.find({ where: { user_name: userName } })).shift();
  //   return user;
  // }

  // async getUserByUserNameWithRelation(userName: string): Promise<User> {
  //   const user = await this.createQueryBuilder('users')
  //     .leftJoinAndSelect('users.posts', 'posts')
  //     .leftJoinAndSelect('posts.media', 'media')
  //     .leftJoinAndSelect('posts.user', 'user')
  //     // .leftJoinAndSelect('posts.message', 'message')
  //     // .leftJoinAndSelect('message.childComments', 'childComments')
  //     // .leftJoinAndSelect('message.userComments', 'userComments')
  //     .where('users.user_name = :userName', { userName: userName })
  //     .orderBy('posts.created_at', 'DESC')
  //     .getOne();
  //   return user;
  // }

  // async getUserByUserNameOrFullname(search: string): Promise<User[]> {
  //   const users = await this.createQueryBuilder('users')
  //     .where('users.user_name  like :search', { search: `${search}%` })
  //     .orWhere('users.name  like :search', { search: `${search}%` })
  //     .orWhere('users.phone  like :search', { search: `${search}%` })
  //     .getMany();

  //   return users;
  // }

  // async getUserByUserNameOrFullnameHome(search: string): Promise<User[]> {
  //   const users = await this.createQueryBuilder('users')
  //     .where('users.user_name  like :search', { search: `%${search}%` })
  //     .orWhere('users.name  like :search', { search: `%${search}%` })
  //     .orWhere('users.phone  like :search', { search: `${search}%` })
  //     .getMany();

  //   return users;
  // }

  // async getUserSuggestForYou(userAuth: User, count: number): Promise<User[]> {
  //   const checkHasFollowing = await userAuth.getFollowingUser();

  //   if (checkHasFollowing.length) {
  //     const users = await Promise.all(
  //       checkHasFollowing.map(async (user: User): Promise<User[]> => {
  //         return user.getFollowingUserRelation();
  //       }),
  //     );
  //     // console.log('Lodash', _)
  //     const userFlatten = _.flattenDeep(users);
  //     const userUnique = _.uniq(userFlatten);

  //     const idsUserFollowing = await userAuth.getFollowing();
  //     idsUserFollowing.push(userAuth.id);
  //     const idsToDeleteSet = new Set(idsUserFollowing);

  //     let results = userUnique.filter((user) => {
  //       return !idsToDeleteSet.has(user.id);
  //     });

  //     if (results.length < count) {
  //       let idResultUsers = results.map((user) => user.id);
  //       idResultUsers = idResultUsers.concat(idsUserFollowing);
  //       const countRemain = count - results.length;

  //       // const t = await this.find({
  //       //   where: {
  //       //     id: Not(In(idResultUsers)),
  //       //   },
  //       //   relations: ['posts', 'posts.media'],
  //       //   take:countRemain
  //       //   // order: {
  //       //   //   posts: 'DESC'
  //       //   // }
  //       // });
  //       // console.log('FUck', t);
  //       const users = await this.createQueryBuilder('users')
  //         .leftJoinAndSelect('users.posts', 'posts')
  //         .leftJoinAndSelect('posts.media', 'media')
  //         .where('users.id NOT IN (:...roles)')
  //         .setParameter('roles', [...idResultUsers])
  //         .take(countRemain)
  //         .getMany();

  //       results = results.concat(users);
  //     }

  //     results = results.splice(0, count);

  //     return results.splice(0, count);
  //   } else {
  //     const users = await this.createQueryBuilder('users')
  //       .leftJoinAndSelect('users.posts', 'posts')
  //       .leftJoinAndSelect('posts.media', 'media')
  //       .where('users.id != :userId', { userId: userAuth.id })
  //       .take(count)
  //       .getMany();

  //     return users;
  //   }

  //   // .where('users.user_name  like :search', { search: `%${search}%` })
  //   // .orWhere('users.name  like :search', { search: `%${search}%` }).getMany()
  // }

  // async getStoryHome(idsUserFollowing: number[]) {
  //   const users = await this.createQueryBuilder('users')
  //     .leftJoinAndSelect('users.stories', 'story')
  //     .where('users.id  IN (:...userIds)')
  //     .where('story.status = :status', { status: ActiveStatus.ACTIVE })
  //     .setParameter('userIds', [...idsUserFollowing])
  //     .orderBy('story.created_at', 'ASC')
  //     .getMany();

  //     console.log('Hello', users)

  //     const usersEffectStory = users.map(user => {
  //       const storiesEffect = user.stories.filter(story => {
  //         return (new Date(story.created_at)).getTime() >= moment().startOf('day').valueOf() && (new Date(story.created_at)).getTime() <= moment().endOf('day').valueOf()
  //       })
  //       console.log('Effect', storiesEffect)
  //       user.stories = storiesEffect
  //       return user
  //     })

  //     // const storiesEffect = users.filter(story => {
  //     //   return (new Date(story.created_at)).getTime() >= moment().startOf('day').valueOf() && (new Date(story.created_at)).getTime() <= moment().endOf('day').valueOf()
  //     // })
  //     return usersEffectStory
  // }

  // async getStoryByUserName(user_name: string) {
  //   const user = await this.createQueryBuilder('users')
  //     .leftJoinAndSelect('users.stories', 'story')
  //     .where('users.user_name = :userName', { userName: user_name })
  //     .where('story.status = :status', { status: ActiveStatus.ACTIVE })
  //     .orderBy('story.created_at', 'ASC')
  //     .getOne();

  //     const storiesEffect = user.stories.filter(story => {
  //       return (new Date(story.created_at)).getTime() >= moment().startOf('day').valueOf() && (new Date(story.created_at)).getTime() <= moment().endOf('day').valueOf()
  //     })
  //     user.stories = storiesEffect
  //     return user
  // }
}
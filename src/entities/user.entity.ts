import { Exclude } from 'class-transformer';
// import moment = require('moment');

// import {
//   ActiveStatus,
//   ActivityStatus,
//   FollowStatus,
//   Gender,
//   PrivateStatus,
//   Status,
//   StoryStatus,
// } from 'src/constants';
import {
  Column,
  Entity, OneToMany, PrimaryGeneratedColumn
} from 'typeorm';
import { Checkout } from './checkout.entity';
// import { ChatMember } from './chat-member.entity';
// import { CommentUser } fr/om './c/omment-user.entity';
// import { Comment } from './/comme/nt.entity';
// import { Conversation } from './/conversation.entity';
// import { Message } from './message.entity';
// import { MessageUser } from './message-user.entity';
// import { Message } from './messages.entity';
// import { PostUser } from './post-user.entity';
// import { Post } from './post.entity';
// import { Relation } from './relation.entity';
// import { Story } from './story.entity';
// import { UserStory } from './user-story.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column()
  password: string;

  @Column({ name: 'type_account' })
  typeAccount: number;

  @Column()
  role: number;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  headline?: string;

  @Column({ nullable: true })
  biography?: string;

  @Column({ nullable: true, name: 'website_url' })
  websiteURL?: string;

  @Column({ nullable: true, name: 'twitter_url' })
  twitterURL?: string;

  @Column({ nullable: true, name: 'facebook_url' })
  facebookURL?: string;

  @Column({ nullable: true, name: 'linkedIn_url' })
  linkedInURL?: string;

  @Column({ nullable: true, name: 'youtube_url' })
  youtubeURL?: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true, name: 'email_token' })
  emailToken?: string;

  @Column({ default: false, name: 'is_block' })
  isBlock?: boolean;

  @Column({ nullable: true, name: 'account_stripe_id' })
  accountStripeID?: string;

  @Column({ nullable: true, name: 'account_stripe_status' })
  accountStripeStatus?: number;

  @Column({ nullable: true, name: 'key_account_stripe' })
  keyAccountStripe?: string;

  @OneToMany(() => Checkout, (checkout) => checkout.user)
  checkout?: Checkout[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;

  // @OneToMany(() => Post, (post) => post.user)
  // posts?: Post[];

  // @OneToMany(() => Story, (story) => story.user)
  // stories?: Story[];

  // @OneToMany(() => Relation, (relation) => relation.userFollower)
  // follower?: Relation[];

  // @OneToMany(() => Relation, (relation) => relation.userFollowing)
  // following?: Relation[];

  // @OneToMany(() => PostUser, (postUser) => postUser.user)
  // postUsers?: PostUser[];

  // @OneToMany(() => UserStory, (userStory) => userStory.user)
  // storyUsers?: UserStory[];

  // @OneToMany(() => CommentUser, (commentUser) => commentUser.user)
  // commentUsers?: CommentUser[];

  // @OneToMany(() => Comment, (comment) => comment.user)
  // comments?: Comment[];

  // @OneToMany(() => Message, (message) => message.user)
  // messages?: Message[];

  // @ManyToMany(
  //   () => Conversation,
  //   (conversation) => conversation.users,
  // )
  // conversations?: Conversation[];
  // @OneToMany(() => ChatMember, (chatMember) => chatMember.user)
  // chatMemberUsers?: ChatMember[];

  // @OneToMany(() => Message, (message) => message.user)
  // messages?: Message[];

  // @OneToMany(() => MessageUser, (messagesUser) => messagesUser.user)
  // messageUser?: MessageUser[];

  // is_following?: FollowStatus;

  // count_follower?: number;

  // count_following?: number;

  // followed_by?: string[];

  // view_all_story?: ViewStory;

  // async isFollowing?(userTarget: User): Promise<FollowStatus> {
  //   const isFollowing = await getRepository(User)
  //     .createQueryBuilder('users')
  //     .innerJoin('users.following', 'relations')
  //     .where('relations.user_id = :userId', { userId: this.id })
  //     .andWhere('relations.friend_id = :friendId', { friendId: userTarget.id })
  //     .andWhere('relations.is_follow = :follow', {
  //       follow: FollowStatus.FOLLOW,
  //     })
  //     .getCount();

  //   return Boolean(isFollowing) ? FollowStatus.FOLLOW : FollowStatus.UN_FOLLOW;
  // }

  // getUserCountPaginate?(
  //   data: User[],
  //   pagination: Pagination,
  // ): [User[], number] {
  //   const { skip, take } = pagination;
  //   const count = data.length;
  //   const posts = data.slice(skip, take + skip);

  //   return [posts, count];
  // }

  // async getViewAll?(userAuth: User): Promise<ViewStory> {
  //   const user = await getRepository(User).createQueryBuilder('users')
  //   .leftJoinAndSelect('users.stories', 'story')
  //   .where('users.user_name = :userName', { userName: this.user_name })
  //   .orderBy('story.created_at', 'ASC')
  //   .getOne();

  //     // if (user) {
  //       const storiesEffect = user.stories.filter(story => {
  //         return (new Date(story.created_at)).getTime() >= moment().startOf('day').valueOf() && (new Date(story.created_at)).getTime() <= moment().endOf('day').valueOf()
  //       })
  //       console.log(storiesEffect)
  //       const storiesEffectUser = storiesEffect

  //       if (!storiesEffectUser.length) {
  //         return ViewStory.NONE
  //       }

  //       const storiesEffectUserIds = storiesEffectUser.map(el => el.id)
  //       const countView = await getRepository(Story)
  //         .createQueryBuilder('stories')
  //         .leftJoin('stories.userStories', 'userStories')
  //         .where('userStories.story_id  IN (:...storyIds)')
  //         .andWhere('userStories.user_id = :userId', { userId: userAuth.id })
  //         .andWhere('userStories.is_view = :is_view', {
  //           is_view: ActiveStatus.ACTIVE,
  //         })
  //         .setParameter('storyIds', [...storiesEffectUserIds])
  //         .getCount();
  //         return countView === storiesEffectUserIds.length ? ViewStory.SAW : ViewStory.SEE
  //     // } else {
  //     //   return ViewStory.NONE

  //     // }

  // }

  // async countFollowingUser?(): Promise<number> {
  //   const countFollowing = await getRepository(User)
  //     .createQueryBuilder('users')
  //     .leftJoin('users.following', 'relations')
  //     .where('relations.user_id = :userId', { userId: this.id })
  //     .andWhere('relations.is_follow = :follow', {
  //       follow: FollowStatus.FOLLOW,
  //     })
  //     .getCount();

  //   return countFollowing;
  // }

  // async idsNotFollowingAndBlockUser?(): Promise<number[]> {
  //   const idsUser = await getRepository(User)
  //     .createQueryBuilder('users')
  //     .select('users.id')
  //     .leftJoin('users.following', 'relations')
  //     .where('relations.user_id = :userId', { userId: this.id })
  //     .andWhere(
  //       new Brackets((qb) => {
  //         qb.where('relations.is_follow != :follow', {
  //           follow: FollowStatus.FOLLOW,
  //         }).orWhere(
  //           new Brackets((q) => {
  //             q.where('relations.is_block = :statusBlock', {
  //               statusBlock: ActiveStatus.ACTIVE,
  //             }).orWhere('relations.blocked = :statusBlock', {
  //               statusBlock: ActiveStatus.ACTIVE,
  //             });
  //           }),
  //         );
  //       }),
  //     )
  //     .getMany();
  //   console.log(idsUser);
  //   return idsUser.map((idUser: User) => idUser.id);
  // }

  // async countFollowerUser?(): Promise<number> {
  //   const countFollower = await getRepository(User)
  //     .createQueryBuilder('users')
  //     .leftJoin('users.follower', 'relations')
  //     .where('relations.friend_id = :userId', { userId: this.id })
  //     .andWhere('relations.is_follow = :follow', {
  //       follow: FollowStatus.FOLLOW,
  //     })
  //     .getCount();

  //   return countFollower;
  // }

  // async getFollowingAndCountPagination?(
  //   pagination: Pagination,
  // ): Promise<[User[], number]> {
  //   const { skip, take } = pagination;
  //   const [usersFollowing, count] = await getRepository(User)
  //     .createQueryBuilder('users')
  //     .leftJoin('users.following', 'relations')
  //     .leftJoinAndSelect('users.posts', 'posts')
  //     .leftJoinAndSelect('posts.media', 'media')
  //     // .leftJoinAndSelect('posts.user', 'user')
  //     .where('relations.user_id = :userId', { userId: this.id })
  //     .andWhere('relations.is_follow = :follow', {
  //       follow: FollowStatus.FOLLOW,
  //     })
  //     .addOrderBy('posts.created_at', 'DESC')
  //     .orderBy('relations.created_at', 'ASC')
  //     .limit(take)
  //     .offset(skip)
  //     .getManyAndCount();

  //   return [usersFollowing, count];
  // }

  // async getSimilarUsers?(userAuth: User): Promise<User[]> {
  //   const [usersFollowing, idsUserAuthFollowing] = await Promise.all([
  //     this.getFollowingUser(),
  //     userAuth.getFollowing(),
  //   ]);

  //   const idUserDeleted = new Set(idsUserAuthFollowing);

  //   const usersSimilar = usersFollowing.filter((user) => {
  //     return !idUserDeleted.has(user.id);
  //   });

  //   const checkIndexAuthUser = usersSimilar.findIndex(
  //     (user) => user.id === userAuth.id,
  //   );

  //   if (checkIndexAuthUser != -1) {
  //     usersSimilar.splice(checkIndexAuthUser, 1);
  //   }

  //   return usersSimilar;
  // }

  // async getFollowing?(): Promise<number[]> {
  //   let usersFollowing = await getRepository(User)
  //     .createQueryBuilder('users')
  //     .select(['users.id'])
  //     .leftJoin('users.following', 'relations')
  //     .where('relations.user_id = :userId', { userId: this.id })
  //     .andWhere('relations.is_follow = :follow', {
  //       follow: FollowStatus.FOLLOW,
  //     })
  //     .getMany();

  //   const idsUser = usersFollowing.map((users) => users.id);
  //   return idsUser;
  // }

  // async getFollowingUser?(): Promise<User[]> {
  //   let usersFollowing = await getRepository(User)
  //     .createQueryBuilder('users')
  //     .leftJoin('users.following', 'relations')
  //     .where('relations.user_id = :userId', { userId: this.id })
  //     .andWhere('relations.is_follow = :follow', {
  //       follow: FollowStatus.FOLLOW,
  //     })
  //     .getMany();

  //   return usersFollowing;
  // }

  // async getFollowingUserRelation?(): Promise<User[]> {
  //   let usersFollowing = await getRepository(User)
  //     .createQueryBuilder('users')
  //     .leftJoin('users.following', 'relations')
  //     .leftJoinAndSelect('users.posts', 'posts')
  //     .leftJoinAndSelect('posts.media', 'media')
  //     .where('relations.user_id = :userId', { userId: this.id })
  //     .andWhere('relations.is_follow = :follow', {
  //       follow: FollowStatus.FOLLOW,
  //     })
  //     .addOrderBy('posts.created_at', 'DESC')
  //     .orderBy('relations.created_at', 'ASC')
  //     .getMany();

  //   return usersFollowing;
  // }

  // async getFollowerAndCountPagination?(
  //   pagination: Pagination,
  // ): Promise<[User[], number]> {
  //   const { skip, take } = pagination;
  //   const [usersFollower, count] = await getRepository(User)
  //     .createQueryBuilder('users')
  //     .leftJoin('users.follower', 'relations')
  //     .leftJoinAndSelect('users.posts', 'posts')
  //     .leftJoinAndSelect('posts.media', 'media')
  //     .where('relations.friend_id = :userId', { userId: this.id })
  //     .andWhere('relations.is_follow = :follow', {
  //       follow: FollowStatus.FOLLOW,
  //     })
  //     .addOrderBy('posts.created_at', 'DESC')
  //     .orderBy('relations.created_at', 'DESC')
  //     .limit(take)
  //     .offset(skip)
  //     .getManyAndCount();

  //   return [usersFollower, count];
  // }

  // async getFollowedBy?(authUser: User): Promise<string[]> {
  //   const idsUserAuhFollowing = await authUser.getFollowing();

  //   if (idsUserAuhFollowing.length) {
  //     const users = await getRepository(User)
  //       .createQueryBuilder('users')
  //       .select(['users.user_name'])
  //       .leftJoin('users.follower', 'relations')
  //       .where('relations.friend_id = :userId', { userId: this.id })
  //       .andWhere('relations.is_follow = :follow', {
  //         follow: FollowStatus.FOLLOW,
  //       })
  //       .andWhere('users.id IN (:...followingAuth)', {
  //         followingAuth: await authUser.getFollowing(),
  //       })
  //       .getMany();

  //     const userNamesUser = users.map((user) => user.user_name);
  //     return userNamesUser;
  //   } else {
  //     return [];
  //   }
  // }
}

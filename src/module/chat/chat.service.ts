import { Injectable, Logger } from '@nestjs/common';
import { ResponseData } from '../../interface/response.interface';
import { UserRepository } from '../user/user.repository';
// import { CurriculumRepository } from './lecture.repository';
import { ChatRepository } from './chat.repository';
import { GetChatDetailDto } from './dto/get-chat-detail-dto';
import { NotFoundException } from '@nestjs/common';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { ChatChannelShow, Order } from 'src/constants';
import { PageDto } from 'src/common/paginate/paginate.dto';
import { ChatDetailShow } from 'src/constants';
import { GetChatChannelDto } from './dto';
@Injectable()
export class ChatService {
  private logger = new Logger(ChatService.name);
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly userRepository: UserRepository,
  ) {}
  async getChatsDetail(
    getChatDetailDto: GetChatDetailDto,
    userID: number,
  ): Promise<ResponseData> {
    const { to, skip, size, page } = getChatDetailDto;

    const user = await this.userRepository.getByID(to);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.chatRepository.createQueryBuilder('chats');
    queryBuilder
      .orderBy('chats.created_at', Order.DESC)
      .leftJoinAndSelect('chats.fromUser', 'fromUser')
      .leftJoinAndSelect('chats.toUser', 'toUser')
      .where('chats.fromUserId = :fromUser', {
        fromUser: userID,
      })
      .andWhere('chats.toUserId = :toUser', {
        toUser: to,
      });

    const itemCount = await queryBuilder.getCount();

    queryBuilder.skip(skip).take(size);

    const { entities: chats } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: {
        skip,
        order: Order.DESC,
        page,
        size,
      },
    });

    const chatDetailShow: ChatDetailShow[] = [];

    chats.forEach((chat) => {
      chatDetailShow.push({
        id: chat.id,
        fromUser: {
          id: chat.fromUser.id,
          name: chat.fromUser.name,
          avatar: chat.fromUser.avatar,
        },
        toUser: {
          id: chat.toUser.id,
          name: chat.toUser.name,
          avatar: chat.toUser.avatar,
        },
        text: chat.text,
        createdAt: chat.created_at,
      });
    });

    const data = new PageDto(chatDetailShow, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get chats successfully!',
      data,
    };

    return responseData;
  }

  async getChatsChannel(
    getChatChannelDto: GetChatChannelDto,
    userID: number,
  ): Promise<ResponseData> {
    const { skip, size, page } = getChatChannelDto;

    const subQuery = this.chatRepository
      .createQueryBuilder('chats')
      .select([
        'LEAST(chats.fromUserId, chats.toUserId) AS user1',
        'GREATEST(chats.fromUserId, chats.toUserId) AS user2',
        'MAX(chats.created_at) AS latest_message_time',
      ])
      .groupBy('user1, user2');

    const mainQuery = this.chatRepository
      .createQueryBuilder('chats')
      .innerJoin(
        '(' + subQuery.getQuery() + ')',
        'lm',
        'LEAST(chats.fromUserId, chats.toUserId) = lm.user1 AND GREATEST(chats.fromUserId, chats.toUserId) = lm.user2 AND chats.created_at = lm.latest_message_time',
      )
      .setParameters(subQuery.getParameters())
      .leftJoinAndSelect('chats.toUser', 'toUser') // Include related user data
      .leftJoinAndSelect('chats.fromUser', 'fromUser') // Include related user data
      .where('chats.fromUserId = :userId OR chats.toUserId = :userId', {
        userId: userID,
      })
      .orderBy('chats.created_at', 'DESC');

    const itemCount = await mainQuery.getCount();

    mainQuery.skip(skip).take(size);

    // const queryBuilder = this.chatRepository.createQueryBuilder('chats');
    // queryBuilder
    //   .orderBy('chats.created_at', Order.DESC)
    //   .leftJoinAndSelect('chats.toUser', 'toUser')
    //   .where('chats.fromUserId = :fromUser', {
    //     fromUser: userID,
    //   })

    const { entities: chatsChannel } = await mainQuery.getRawAndEntities();

    // const itemCount = await queryBuilder.getCount();

    // queryBuilder.skip(skip).take(size);

    // const { entities: chats } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: {
        skip,
        order: Order.DESC,
        page,
        size,
      },
    });

    const chatChannelShows: ChatChannelShow[] = [];

    chatsChannel.forEach((chat) => {
      chatChannelShows.push({
        id: chat.id,
        user: {
          id: chat.toUser.id === userID ? chat.fromUser.id : chat.toUser.id,
          name:
            chat.toUser.id === userID ? chat.fromUser.name : chat.toUser.name,
          avatar:
            chat.toUser.id === userID ? chat.fromUser.avatar : chat.toUser.avatar,
        },
        latestMessage: {
          text: chat.text,
          user: {
            id: chat.fromUser.id,
            name: chat.fromUser.name,
            avatar: chat.fromUser.avatar,
          },
          createdAt: chat.created_at,
        },
      });
    });

    const data = new PageDto(chatChannelShows, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get chats channel successfully!',
      data,
    };

    return responseData;
  }
}

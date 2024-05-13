import { Injectable, Logger } from '@nestjs/common';
import { ResponseData } from '../../interface/response.interface';
import { UserRepository } from '../user/user.repository';
// import { CurriculumRepository } from './lecture.repository';
import { ChatRepository } from './chat.repository';
import { GetChatDetailDto } from './dto/get-chat-detail-dto';
import { NotFoundException } from '@nestjs/common';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { Order } from 'src/constants';
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

    queryBuilder.skip(skip).take(skip);

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


    const queryBuilder = this.chatRepository.createQueryBuilder('chats');
    queryBuilder
      .orderBy('chats.created_at', Order.DESC)
      .leftJoinAndSelect('chats.toUser', 'toUser')
      .where('chats.fromUserId = :fromUser', {
        fromUser: userID,
      })
    

    // const itemCount = await queryBuilder.getCount();

    // queryBuilder.skip(skip).take(skip);

    // const { entities: chats } = await queryBuilder.getRawAndEntities();

    // const pageMetaDto = new PageMetaDto({
    //   itemCount,
    //   pageOptionsDto: {
    //     skip,
    //     order: Order.DESC,
    //     page,
    //     size,
    //   },
    // });

    // const chatDetailShow: ChatDetailShow[] = [];

    // chats.forEach((chat) => {
    //   chatDetailShow.push({
    //     id: chat.id,
    //     fromUser: {
    //       id: chat.fromUser.id,
    //       name: chat.fromUser.name,
    //       avatar: chat.fromUser.avatar,
    //     },
    //     toUser: {
    //       id: chat.toUser.id,
    //       name: chat.toUser.name,
    //       avatar: chat.toUser.avatar,
    //     },
    //     text: chat.text,
    //     createdAt: chat.created_at,
    //   });
    // });

    // const data = new PageDto(chatDetailShow, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get chats channel successfully!',
      // data,
    };

    return responseData;
  }
}

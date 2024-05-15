import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway';
import { ChatRepository } from './chat.repository';
import { SocketRepository } from './socket.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat, Socket, User } from 'src/entities';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Socket, User]), UserModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatRepository, SocketRepository, ChatService],
})
export class ChatModule {}
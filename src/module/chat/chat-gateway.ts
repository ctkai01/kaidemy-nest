import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { ChatRepository } from './chat.repository';
import { SocketRepository } from './socket.repository';
import { NotificationService } from '../notification/notification.service';
import { ProducerService } from '../queues/producer.service';
import { NotificationPayload, TITLE_RECEIVE_MESSAGE } from 'src/constants';

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer() io: Server;

  constructor(
    private readonly socketRepository: SocketRepository,
    private readonly chatRepository: ChatRepository,
    private readonly producerService: ProducerService,

  ) {}

  afterInit() {
    this.logger.log('Initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    const { sockets } = this.io.sockets;

    this.logger.log(`Client id: ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  async handleDisconnect(client: any) {
    this.logger.log(`Cliend id:${client.id} disconnected`);
    await this.socketRepository.delete({
      socketId: client.id,
    });
  }

  @SubscribeMessage('join')
  handleJoinChat(client: any, data: any) {
    this.socketRepository.save({
      socketId: client.id,
      userId: data.userID,
    });
  }
  @SubscribeMessage('chat')
  async handleMessage(client: any, data: any) {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${JSON.stringify(data)}`);
    const receiverSocketIDs = await this.socketRepository.find({
      where: {
        userId: data.to,
      },
    });

    receiverSocketIDs.forEach((receiverSocketID) => {
      this.io.sockets.to(receiverSocketID.socketId).emit('receive', {
        text: data.text,
        from: data.from,
        to: data.to,
      });
    });

    const chat = await this.chatRepository.save({
      fromUser: data.from,
      toUser: data.to,
      text: data.text,
    });

    this.producerService.addToNotificationQueue({
      toID: [data.to],
      fromID: data.from,
      data: {
        chatID: `${chat.id}`,
        text: chat.text,
        toID: `${data.to}`,
        fromID: `${data.from}`,
        type: NotificationPayload.NOTIFICATION_CHAT,
      },
      type: NotificationPayload.NOTIFICATION_CHAT,
    });
    // return {
    //   event: 'pong',
    //   data: 'Wrong data that will make the test fail',
    // };
  }
}

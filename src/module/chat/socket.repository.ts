import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { Chat } from 'src/entities/chat.entity';
import { Socket } from 'src/entities';

@EntityRepository(Socket)
export class SocketRepository extends Repository<Socket> {
  private logger = new Logger(SocketRepository.name);

  constructor(
    @InjectRepository(Socket)
    private socketRepository: Repository<Socket>,
  ) {
    super(
      socketRepository.target,
      socketRepository.manager,
      socketRepository.queryRunner,
    );
  }
}

import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
// import { defaultAvatar, getStartEndDateNowTimeStamp } from 'src/untils/until';
import { User } from 'src/entities/user.entity';
import _ = require('lodash');
import { InjectRepository } from '@nestjs/typeorm';
import { prettyJsonString } from 'src/utils';
import {} from "pg"
// import moment = require('moment');
// import { ActiveStatus, Status } from 'src/constants';
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  private logger = new Logger(UserRepository.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super(
      userRepository.target,
      userRepository.manager,
      userRepository.queryRunner,
    );
  }
  async createUser(data: Partial<User>): Promise<User> {
    try {
      const user = this.create(data);
      const userCreated = await this.save(user);

      return userCreated;
    } catch (err) {
      this.logger.error(err);

      if (err.code === '23505') {
        throw new ConflictException('Email already exists');
      }

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getByEmail(email: string): Promise<User> {
    try {
      const user = await this.findOne({
        where: [{ email: email }],
      });
      this.logger.log(prettyJsonString(user));
      return user;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getByEmailToken(emailToken: string): Promise<User> {
    try {
      const user = await this.findOne({
        where: [{ emailToken }],
      });
      this.logger.log(prettyJsonString(user));
      return user;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getByID(id: number): Promise<User> {
    try {
      const user = await this.findOneBy({
        id,
      });
      return user;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getUserByIDRelation(
    userID: number,
    relations: string[],
  ): Promise<User | null> {
    const user = await this.findOne({
      where: {
        id: userID,
      },
      relations,
    });
    return user;
  }

  async updateData(user: User): Promise<User> {
    try {
      const data = await this.save(user);
      return data;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }

}

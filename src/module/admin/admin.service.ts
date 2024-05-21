import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ACCOUNT_NORMAL, ADMIN } from 'src/constants';
import { User } from 'src/entities';
import { hashData } from 'src/utils';
import { ResponseData } from '../../interface/response.interface';
import { CreateUserDto } from '../auth/dto';
import { CourseRepository } from '../courses/course.repository';
import { CurriculumRepository } from '../curriculum/curriculum.repository';
import { LearningRepository } from '../learning/learning.repository';
// import { CurriculumRepository } from './lecture.repository';
import { LectureRepository } from '../lecture/lecture.repository';
import { QuestionRepository } from '../question/question.repository';
import { UserRepository } from '../user/user.repository';
import { UpdateAdminDto } from './dto/update-admin-dto';
import * as bcrypt from 'bcryptjs';
import { GetAdminDto } from './dto';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { PageDto } from 'src/common/paginate/paginate.dto';
import { arrayMinSize } from 'class-validator';

@Injectable()
export class AdminService {
  private logger = new Logger(AdminService.name);
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly userRepository: UserRepository,
    private readonly learningRepository: LearningRepository,
  ) {}
  async createAdmin(createUserDto: CreateUserDto): Promise<ResponseData> {
    const { email, name, password } = createUserDto;

    const passwordHash = await hashData(password);
    const adminCreate: Partial<User> = {
      email,
      name,
      role: ADMIN,
      typeAccount: ACCOUNT_NORMAL,
      password: passwordHash,
    };

    const adminCreated = await this.userRepository.createUser(adminCreate);

    const responseData: ResponseData = {
      message: 'Create admin successfully!',
      data: adminCreated,
    };

    return responseData;
  }

  async updateAdmin(
    updateAdminDto: UpdateAdminDto,
    adminID: number,
  ): Promise<ResponseData> {
    const { name, password } = updateAdminDto;

    const admin = await this.userRepository.findOne({
      where: {
        id: adminID,
        role: ADMIN,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (password) {
      const passwordHash = await hashData(password);

      admin.password = passwordHash;
    }

    admin.name = name;

    await this.userRepository.save(admin);

    const responseData: ResponseData = {
      message: 'Update admin successfully!',
      data: admin,
    };

    return responseData;
  }

  async deleteAdmin(adminID: number): Promise<ResponseData> {
    const admin = await this.userRepository.findOne({
      where: {
        id: adminID,
        role: ADMIN,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    await this.userRepository.delete(adminID);

    const responseData: ResponseData = {
      message: 'Delete admin successfully!',
    };

    return responseData;
  }

  async getAdmins(getAdminDto: GetAdminDto): Promise<ResponseData> {
    const { order, skip, size, page, search } = getAdminDto;
    const queryBuilder = this.userRepository.createQueryBuilder('users');
    queryBuilder
      .orderBy('users.created_at', order)
      .where('users.role = :role', {
        role: ADMIN,
      });

    if (search) {
      queryBuilder.andWhere('UPPER(users.name) LIKE UPPER(:searchQuery)', {
        searchQuery: `%${search}%`,
      });
    }

    const itemCount = await queryBuilder.getCount();

    queryBuilder.skip(skip).take(size);
    const { entities: admins } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: {
        skip,
        order,
        page,
        size,
      },
    });

    const data = new PageDto(admins, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get admins successfully!',
      data,
    };

    return responseData;
  }
}

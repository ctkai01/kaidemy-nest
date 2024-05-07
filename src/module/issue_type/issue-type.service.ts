import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
import { PageDto } from 'src/common/paginate/paginate.dto';
import { IssueType } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CreateIssueTypeDto, UpdateIssueTypeDto } from './dto';
import { IssueTypeRepository } from './issue-type.repository';

@Injectable()
export class IssueTypeService {
  private logger = new Logger(IssueTypeService.name);
  constructor(private readonly issueTypeRepository: IssueTypeRepository) {}
  async createIssueType(
    createIssueTypeDto: CreateIssueTypeDto,
  ): Promise<ResponseData> {
    const { name } = createIssueTypeDto;
    const issueType: IssueType = {
      name,
    };

    const issueTypeCreate =
      await this.issueTypeRepository.createIssueType(issueType);

    const responseData: ResponseData = {
      message: 'Create issue type successfully!',
      data: issueTypeCreate,
    };

    return responseData;
  }

  async updateIssueType(
    updateIssueTypeDto: UpdateIssueTypeDto,
    issueTypeID: number,
  ): Promise<ResponseData> {
    const { name } = updateIssueTypeDto;

    const issueType =
      await this.issueTypeRepository.getIssueTypeById(issueTypeID);

    if (!issueType) {
      throw new NotFoundException('Issue type not found');
    }

    if (name) {
      const issueTypeByName =
        await this.issueTypeRepository.getIssueTypeByName(name);

      if (issueTypeByName && issueTypeByName.id !== issueTypeID) {
        throw new ConflictException('Name already exists');
      }
      issueType.name = name;
    }


    await this.issueTypeRepository.save(issueType);
    const responseData: ResponseData = {
      message: 'Update issue type successfully!',
      data: issueType,
    };

    return responseData;
  }

  async deleteIssueType(issueTypeID: number): Promise<ResponseData> {
    const issueType = await this.issueTypeRepository.getIssueTypeById(issueTypeID);

    if (!issueType) {
      throw new NotFoundException('Issue type not found');
    }

    await this.issueTypeRepository.delete(issueTypeID);

    const responseData: ResponseData = {
      message: 'Delete issue type successfully!',
    };

    return responseData;
  }

  async getIssueTypes(
    pageCommonOptionsDto: PageCommonOptionsDto,
  ): Promise<ResponseData> {
    const queryBuilder = this.issueTypeRepository.createQueryBuilder('issue_type');
    queryBuilder
      .orderBy('issue_type.created_at', pageCommonOptionsDto.order)

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
      message: 'Get issue types successfully!',
      data,
    };

    return responseData;
  }
}

import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
import { PageDto } from 'src/common/paginate/paginate.dto';
import { Category } from 'src/entities/category.entity';
import { ResponseData } from '../../interface/response.interface';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
  private logger = new Logger(CategoryService.name);
  constructor(private readonly categoryRepository: CategoryRepository) {}
  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ResponseData> {
    const { name, parentID } = createCategoryDto;

    // Check parentID exist
    if (parentID) {
      const parentCategory =
        await this.categoryRepository.getCategoryById(parentID);
      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category: Category = {
      name,
      parentID: parentID,
    };

    const categoryCreate =
      await this.categoryRepository.createCategory(category);

    const responseData: ResponseData = {
      message: 'Create category successfully!',
      data: categoryCreate,
    };

    return responseData;
  }

  async updateCategory(
    updateCategoryDto: UpdateCategoryDto,
    categoryID: number,
  ): Promise<ResponseData> {
    const { name, parentID } = updateCategoryDto;

    const category = await this.categoryRepository.getCategoryById(categoryID);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (name) {
      const priceByTier = await this.categoryRepository.getCategoryByName(name);

      if (priceByTier && priceByTier.id !== categoryID) {
        throw new ConflictException('Name already exists');
      }
      category.name = name;
    }

    if (parentID) {
      // console.log('parentID: ', parentID);
      const categoryParent =
        await this.categoryRepository.getCategoryById(parentID);

      if (!categoryParent) {
        throw new NotFoundException('Category parent not found');
      }
    }
    category.parentID = parentID || null;

    await this.categoryRepository.save(category);
    const responseData: ResponseData = {
      message: 'Update category successfully!',
      data: category,
    };

    return responseData;
  }

  async deleteCategory(categoryID: number): Promise<ResponseData> {
    const category = await this.categoryRepository.getCategoryById(categoryID);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepository.delete(categoryID);

    const responseData: ResponseData = {
      message: 'Delete category successfully!',
    };

    return responseData;
  }

  async getCategoryByID(categoryID: number): Promise<ResponseData> {
    const category =
      await this.categoryRepository.getCategoryByIdRelation(categoryID);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const responseData: ResponseData = {
      message: 'Get category successfully!',
      data: category,
    };

    return responseData;
  }

  async getCategories(
    pageCommonOptionsDto: PageCommonOptionsDto,
  ): Promise<ResponseData> {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');
    queryBuilder
      .orderBy('category.created_at', pageCommonOptionsDto.order)
      .leftJoinAndSelect('category.children', 'children');

    const itemCount = await queryBuilder.getCount();

    queryBuilder
      .skip(pageCommonOptionsDto.skip)
      .take(pageCommonOptionsDto.size);

    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageCommonOptionsDto,
    });
    const data = new PageDto(entities, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get categories successfully!',
      data,
    };

    return responseData;
  }
}

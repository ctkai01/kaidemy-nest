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
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/entities';
import { In, Repository } from 'typeorm';
import { CourseStatus, MenuCategory, MenuClass } from 'src/constants';
import { GetCategoryDto } from './dto/get-category-dto';

@Injectable()
export class CategoryService {
  private logger = new Logger(CategoryService.name);
  constructor(
    private readonly categoryRepository: CategoryRepository,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}
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

  async getCategories(getCategoryDto: GetCategoryDto): Promise<ResponseData> {
    const { order, size, skip, page, parentID, search, menu } = getCategoryDto;

    if (menu) {
      const queryBuilder =
        this.categoryRepository.createQueryBuilder('category');
      queryBuilder
        .orderBy('category.created_at', order)
        .leftJoinAndSelect('category.children', 'children')
        .where('category.parentID IS NULL');

      const { entities: categories } = await queryBuilder.getRawAndEntities();

      const menus = categories.map((category) => {
        const groupName = category.name.toLowerCase().split(' ').join('_');
        const children = this.mapCategoriesToMenuCategories(category.children);

        const menu: MenuCategory = {
          name: category.name,
          parentID: category.parentID,
          groupName,
          children: children,
        };

        return menu;
      });

      const menusCategories: MenuCategory[] = [];
      const groupCategories = 'categories';
      menusCategories.push({
        name: 'Categories',
        parentID: null,
        groupName: groupCategories,
        children: menus,
      });
      const menuClass: MenuClass = {};

      this.genClass(menusCategories, menuClass);
      console.log('menuClass: ', menuClass);
      const responseData: ResponseData = {
        message: 'Get categories successfully!',
        data: { item: categories, class: menuClass },
      };
      return responseData;
    } else {
      const queryBuilder =
        this.categoryRepository.createQueryBuilder('category');
      queryBuilder
        .orderBy('category.created_at', order)
        .leftJoinAndSelect('category.children', 'children');

      if (parentID) {
        if (parentID === -1) {
          queryBuilder.where('category.parentID IS NULL');
        } else {
          queryBuilder.where('category.parentID = :parentID', { parentID });
        }
      }

      if (search) {
        queryBuilder.andWhere('UPPER(category.name) LIKE UPPER(:searchQuery)', {
          searchQuery: `%${search}%`,
        });
      }

      const itemCount = await queryBuilder.getCount();

      queryBuilder.skip(skip).take(size);

      const { entities } = await queryBuilder.getRawAndEntities();

      const pageMetaDto = new PageMetaDto({
        itemCount,
        pageOptionsDto: {
          skip,
          order,
          page,
          size,
        },
      });
      const data = new PageDto(entities, pageMetaDto);

      const responseData: ResponseData = {
        message: 'Get categories successfully!',
        data,
      };

      return responseData;
    }
  }

  async getTop5Categories(): Promise<ResponseData> {
    const top5Categories = await this.courseRepository
      .createQueryBuilder('courses')
      .select('courses.subCategoryId', 'subcategoryID')
      .addSelect('COUNT(*)', 'count')
      .where('courses.reviewStatus = :reviewStatus', {
        reviewStatus: CourseStatus.REVIEW_VERIFY,
      })
      .groupBy('courses.subCategoryId')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const categoriesID = top5Categories.map(
      (category) => category.subcategoryID,
    );

    const categories = await this.categoryRepository.find({
      where: { id: In([...categoriesID]) },
    });

    const responseData: ResponseData = {
      message: 'Get top categories successfully!',
      data: categories,
    };

    return responseData;
  }

  private mapCategoriesToMenuCategories(
    categories: Category[],
  ): MenuCategory[] {
    return categories.map((category) => {
      const menuCategory: MenuCategory = {
        name: category.name,
        parentID: category.parentID,
        groupName: category.name.toLowerCase().split(' ').join('_'),
        children: [],
      };
      return menuCategory;
    });
  }

  private genClass(menus: MenuCategory[], menuClass: MenuClass) {
    menus.forEach((menu) => {
      if (menu.children.length && menu.groupName) {
        menuClass[`group/${menu.groupName}`] = `group/${menu.groupName}`;
        menuClass[`group-hover/${menu.groupName}:block`] =
          `group-hover/${menu.groupName}:block`;

        // Recursively call genClass for children
        this.genClass(menu.children, menuClass);
      }
    });
  }
}

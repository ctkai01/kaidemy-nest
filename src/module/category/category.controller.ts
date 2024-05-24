import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { AdminRoleGuard } from 'src/guards/admin-role.guard';
import { TransformInterceptor } from 'src/response/custom';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Public } from 'src/decorators';
import { GetCategoryDto } from './dto/get-category-dto';

@Controller('categories')
@UseFilters(new HttpExceptionValidateFilter())
@UseInterceptors(TransformInterceptor)
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post('')
  @UseGuards(AdminRoleGuard)
  @HttpCode(HttpStatus.CREATED)
  createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ResponseData> {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Put(':id')
  @UseGuards(AdminRoleGuard)
  @HttpCode(HttpStatus.OK)
  updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('id') categoryID: number,
  ): Promise<ResponseData> {
    return this.categoryService.updateCategory(updateCategoryDto, categoryID);
  }

  @Delete(':id')
  @UseGuards(AdminRoleGuard)
  @HttpCode(HttpStatus.OK)
  deleteCategory(@Param('id') categoryID: number): Promise<ResponseData> {
    return this.categoryService.deleteCategory(categoryID);
  }

  @Get('top')
  @Public()
  @HttpCode(HttpStatus.OK)
  getTop5Categories(): Promise<ResponseData> {
    return this.categoryService.getTop5Categories();
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  getCategoryByID(@Param('id') categoryID: number): Promise<ResponseData> {
    return this.categoryService.getCategoryByID(categoryID);
  }

  @Get('')
  @Public()
  @HttpCode(HttpStatus.OK)
  getCategories(
    @Query()getCategoryDto: GetCategoryDto,
  ): Promise<ResponseData> {
    return this.categoryService.getCategories(getCategoryDto);
  }
}

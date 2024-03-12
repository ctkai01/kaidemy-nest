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
  UseGuards
} from '@nestjs/common';
import { PageCommonOptionsDto } from 'src/common/paginate/page-option.dto';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { AdminRoleGuard } from 'src/guards/admin-role.guard';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('categories')
@UseFilters(new HttpExceptionValidateFilter())
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
  deletePrice(@Param('id') categoryID: number): Promise<ResponseData> {
    return this.categoryService.deleteCategory(categoryID);
  }

  // @Get()
  // @HttpCode(HttpStatus.OK)
  // getPrices(
  //   @Query() pageCommonOptionsDto: PageCommonOptionsDto,
  // ): Promise<ResponseData> {
  //   return this.priceService.getPrices(pageCommonOptionsDto);
  // }

  // @Public()
  // @Post('change-password')
  // @HttpCode(HttpStatus.OK)
  // signup(
  //   @Body() changePasswordDto: ChangePasswordDto,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.userService.changePassword(changePasswordDto, userID);
  // }

  // @Public()
  // @Post('login')
  // @HttpCode(HttpStatus.OK)
  // login(@Body() loginUserDto: LoginUserDto): Promise<ResponseData> {
  //   return this.authService.loginUser(loginUserDto);
  // }

  // @Public()
  // @Post('/login')
  // @UseInterceptors(TransformInterceptor)
  // @UseFilters(new HttpExceptionValidateFilter())
  // login(@Body() loginUserDto: LoginUserDto): Promise<ResponseData> {
  //   return this.authService.login(loginUserDto);
  // }

  // @UseGuards(AtGuard)
  // @Post('logout')
  // logout(@GetCurrentUserId() userId: number): Promise<void> {
  //   return this.authService.logout(userId);
  // }

  // @Public()
  // @UseGuards(RtGuard)
  // @Post('refreshToken')
  // refreshToken(
  //   @Request() req: any,
  //   @GetCurrentUser('refresh_token') refreshToken: string,
  //   @GetCurrentUserId() userId: any,
  // ): Promise<Tokens> {
  //   return this.authService.refreshToken(userId, refreshToken);
  // }
}

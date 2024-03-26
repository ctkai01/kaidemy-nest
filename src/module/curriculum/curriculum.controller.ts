import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseFilters,
} from '@nestjs/common';
import { GetCurrentUserID } from 'src/decorators';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumDto, UpdateCurriculumDto } from './dto';

@Controller('curriculums')
@UseFilters(new HttpExceptionValidateFilter())
export class CurriculumController {
  constructor(private curriculumService: CurriculumService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createCurriculum(
    @Body() createCurriculumDto: CreateCurriculumDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.curriculumService.createCurriculum(createCurriculumDto, userID);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateCurriculum(
    @Body() updateCurriculumDto: UpdateCurriculumDto,
    @Param('id') curriculumID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.curriculumService.updateCurriculum(
      updateCurriculumDto,
      userID,
      curriculumID,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteCurriculum(
    @Param('id') curriculumID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.curriculumService.deleteCurriculum(curriculumID, userID);
  }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // getCategoryByID(@Param('id') categoryID: number): Promise<ResponseData> {
  //   return this.categoryService.getCategoryByID(categoryID);
  // }

  // @Get()
  // @HttpCode(HttpStatus.OK)
  // getCategories(
  //   @Query() pageCommonOptionsDto: PageCommonOptionsDto,
  // ): Promise<ResponseData> {
  //   return this.categoryService.getCategories(pageCommonOptionsDto);
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

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
} from '@nestjs/common';
import { PageLevelOptionsDto } from 'src/common/paginate/levels/page-option.dto';
import { PageUserOptionsDto } from 'src/common/paginate/users/page-option.dto';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { GetCurrentUserID } from 'src/decorators';
import { AdminRoleGuard } from 'src/guards/admin-role.guard';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import {  CreateLevelDto, UpdateLevelDto } from './dto';
import { LevelService } from './level.service';


@Controller('levels')
@UseFilters(new HttpExceptionValidateFilter())
export class LevelController {
  constructor(private levelService: LevelService) {}

  @Post('')
  @UseGuards(AdminRoleGuard)
  @HttpCode(HttpStatus.CREATED)
  createLevel(@Body() createLevelDto: CreateLevelDto): Promise<ResponseData> {
    return this.levelService.createLevel(createLevelDto);
  }

  @Put(':id')
  @UseGuards(AdminRoleGuard)
  @HttpCode(HttpStatus.OK)
  updateLevel(
    @Body() updateLevelDto: UpdateLevelDto,
    @Param('id') levelID: number,
  ): Promise<ResponseData> {
    return this.levelService.updateLevel(updateLevelDto, levelID);
  }

  @Delete(':id')
  @UseGuards(AdminRoleGuard)
  @HttpCode(HttpStatus.OK)
  deleteLevel(@Param('id') levelID: number): Promise<ResponseData> {
    return this.levelService.deleteLevel(levelID);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getLevels(
    @Query() pageLevelOptionsDto: PageLevelOptionsDto,
  ): Promise<ResponseData> {
    return this.levelService.getLevels(pageLevelOptionsDto);
  }

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

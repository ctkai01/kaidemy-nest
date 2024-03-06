import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post, Put, UploadedFile, UseFilters, UseGuards, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { GetCurrentUserID, Public } from 'src/decorators';
import { AdminRoleGuard } from 'src/guards/admin-role.guard';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { BlockUserDto } from './dto/block-user-dto';
import { ChangePasswordDto } from './dto/create-user-dto';
import { UpdateProfileDto } from './dto/update-user-dto';
import { multerImageOptions, multerVideoOptions } from './multer.config';
import { UserService } from './user.service';

@Controller('users')
@UseFilters(new HttpExceptionValidateFilter())
export class UserController {
  constructor(private userService: UserService) {}

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.userService.changePassword(changePasswordDto, userID);
  }

  @Post('me')
  @HttpCode(HttpStatus.OK)
  profileByMe(@GetCurrentUserID() userID: number): Promise<ResponseData> {
    return this.userService.profileByMe(userID);
  }

  @Put('me')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar', multerImageOptions))
  updateProfile(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() updateProfileDto: UpdateProfileDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.userService.updateProfile(userID, updateProfileDto, avatar);
  }

  @Put(':id/block')
  @UseGuards(AdminRoleGuard)
  @HttpCode(HttpStatus.OK)
  blockUser(
    @Param('id') userID: number,
    @Body() blockUserDto: BlockUserDto,
  ): Promise<ResponseData> {
    return this.userService.blockUser(userID, blockUserDto);
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

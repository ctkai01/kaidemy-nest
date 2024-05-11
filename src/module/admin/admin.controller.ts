import {
  Body,
  Controller, Delete, Get, HttpCode,
  HttpStatus, Param, Post, Put, Query, UseFilters,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
import { SupperAdminRoleGuard } from 'src/guards/supper-admin-role.guard';
import { TransformInterceptor } from 'src/response/custom';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { CreateUserDto } from '../auth/dto';
import { AdminService } from './admin.service';
import { GetAdminDto } from './dto';
import { UpdateAdminDto } from './dto/update-admin-dto';

@Controller('admins')
@UseFilters(new HttpExceptionValidateFilter())
@UseGuards(SupperAdminRoleGuard)
@UseInterceptors(TransformInterceptor)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createAdmin(@Body() createUserDto: CreateUserDto): Promise<ResponseData> {
    return this.adminService.createAdmin(createUserDto);
  }


  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateAdmin(
    @Body() updateAdminDto: UpdateAdminDto,
    @Param('id') adminID: number,
  ): Promise<ResponseData> {
    return this.adminService.updateAdmin(updateAdminDto, adminID);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteQuestionLecture(@Param('id') adminID: number): Promise<ResponseData> {
    return this.adminService.deleteAdmin(adminID);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  getAdmins(
    @Query() getAdminDto: GetAdminDto,
  ): Promise<ResponseData> {
    return this.adminService.getAdmins(getAdminDto);
  }
}

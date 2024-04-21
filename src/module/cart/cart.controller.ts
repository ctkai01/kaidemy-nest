import {
  Body,
  Controller, Delete, Get, HttpCode,
  HttpStatus, Param, Post, UseFilters
} from '@nestjs/common';
import { GetCurrentUserID } from 'src/decorators';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { CartService } from './cart.service';
import { CreateQuestionDto } from './dto';

@Controller('carts')
@UseFilters(new HttpExceptionValidateFilter())
export class CartController {
  constructor(private cartService: CartService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createCart(@GetCurrentUserID() userID: number): Promise<ResponseData> {
    return this.cartService.createCart(userID);
  }

  @Post('/item/:id')
  @HttpCode(HttpStatus.OK)
  addCourseToCart(
    @GetCurrentUserID() userID: number,
    @Param('id') courseID: number,
  ): Promise<ResponseData> {
    return this.cartService.addCourseToCart(userID, courseID);
  }

  @Delete('/item/:id')
  @HttpCode(HttpStatus.OK)
  deleteCourseToCart(
    @GetCurrentUserID() userID: number,
    @Param('id') courseID: number,
  ): Promise<ResponseData> {
    return this.cartService.deleteCourseToCart(userID, courseID);
  }

  @Post('/claims')
  @HttpCode(HttpStatus.OK)
  claimsPayment(@GetCurrentUserID() userID: number): Promise<ResponseData> {
    return this.cartService.claimsPayment(userID);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  getCart(@GetCurrentUserID() userID: number): Promise<ResponseData> {
    return this.cartService.getCart(userID);
  }
}

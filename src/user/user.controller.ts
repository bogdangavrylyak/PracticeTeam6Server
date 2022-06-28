import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtTokenDto } from './dto/jwt-token.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './decorators/user.decorator';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { CartProductCount } from './dto/cart-product-count.dto';
import { AddCartDto } from './dto/add-cart.dto';

@Controller('user')
@ApiTags('user')
export class UserController {
  private readonly l = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Post('/sign-up')
  public async signUp(@Body() body: CreateUserDto) {
    return await this.userService.signUp(body);
  }

  @Post('/log-in')
  public async logIn(@Body() body: LoginDto) {
    return await this.userService.logIn(body);
  }

  @Post('refresh')
  @ApiResponse({ type: JwtTokenDto })
  async refresh(@Body() body: RefreshDto) {
    this.l.log('--- refresh ---');

    return this.userService.refreshAccessToken(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth')
  async auth(@User() user: UserDto) {
    this.l.log('--- auth ---');

    return this.userService.authUserInfo(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-cart')
  async getCart(@User() user: UserDto) {
    this.l.log('--- get-cart ---');

    return this.userService.getCart(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cart-add')
  async cartAdd(@User() user: UserDto, @Body() addCartDto: AddCartDto) {
    this.l.log('--- cart-add ---');

    return this.userService.cartAdd(user.id, addCartDto.productId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('cart-product-count')
  async cartProductCount(
    @User() user: UserDto,
    @Body() body: CartProductCount,
  ) {
    this.l.log('--- auth ---');

    return this.userService.cartProductCount(
      user.id,
      body.productId,
      body.sign,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cart-product-delete')
  async cartProductDelete(
    @User() user: UserDto,
    @Query('productId') productId: number,
  ) {
    this.l.log('--- auth ---');

    return this.userService.cartProductDelete(user.id, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(@User() user: UserDto) {
    this.l.log('--- auth ---');

    return this.userService.authUserInfo(user.id);
  }
}

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

  // @Get()
  // async findAll() {
  //   return this.userService.findAll();
  // }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updateUserDto: CreateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtTokenDto } from './dto/jwt-token.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Firewall } from './decorators/firewall.decorator';
import { LoginDto } from './dto/login.dto';

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

  @Firewall({
    anonymous: true, // just to disable JwtAuthGuard
  })
  @Post('refresh')
  @ApiResponse({ type: JwtTokenDto })
  async refresh(@Body() body: RefreshDto) {
    this.l.log('--- refresh ---');

    return this.userService.refreshAccessToken(body.refreshToken);
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

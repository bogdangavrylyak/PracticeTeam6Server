import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import User from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TokenExpiredError } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import PostgresErrorCode from 'src/typeorm/postgresErrorCode.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtTokenDto } from './dto/jwt-token.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { LoginDto } from './dto/login.dto';

const saltRounds = 10;

const access_token_expires_in = 24 * 60 * 60;
const refresh_token_expires_in = 31 * 24 * 60 * 60;

@Injectable()
export class UserService {
  private readonly l = new Logger(UserService.name);

  constructor(private readonly jwtService: JwtService) {}

  @InjectRepository(User)
  private readonly repository: Repository<User>;

  @Inject(ConfigService)
  private readonly config: ConfigService;

  public async signUp(signUpData: CreateUserDto) {
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(signUpData.password, salt);
      const createdUser = await this.create({
        ...signUpData,
        password: hashedPassword,
      });

      return {
        accessToken: await this.generateAccessToken(createdUser.id),
        refreshToken: await this.generateRefreshToken(createdUser.id),
      };
    } catch (error) {
      if (error?.driverError.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.l.error(`AuthService.signUp() ${error.message}`);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async logIn(logInData: LoginDto) {
    try {
      const user = await this.repository.findOne({
        where: {
          Email: logInData.email,
        },
      });

      if (!user) {
        throw new UnprocessableEntityException('User is not found');
      }

      const isPasswordMatching = await bcrypt.compare(
        logInData.password,
        user.Password,
      );

      if (!isPasswordMatching) {
        throw new Error('Password is not matching');
      }

      return {
        accessToken: await this.generateAccessToken(user.id),
        refreshToken: await this.generateRefreshToken(user.id),
      };
    } catch (error) {
      console.log('error: ', error);
      console.log('error.Error: ', error.message);
      if (
        error.message === 'Password is not matching' ||
        error instanceof UnprocessableEntityException
      ) {
        throw new HttpException('Wrong Credentials', HttpStatus.UNAUTHORIZED);
      }
      this.l.error(`AuthService.signUp() ${error.message}`);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async refreshAccessToken(encodedRefreshTokenDto: string) {
    try {
      const refreshTokenDto: JwtPayloadDto = await this.jwtService.verifyAsync(
        encodedRefreshTokenDto,
      );

      const user = await this.findOne(refreshTokenDto.sub);

      if (!user) {
        throw new UnprocessableEntityException('Refresh token is not found');
      }

      if (user.refreshToken !== encodedRefreshTokenDto) {
        throw new BadRequestException('Incorrect refresh token');
      }

      return this.generateAccessToken(user.id);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
  }

  public async validateJwtUser(payload: JwtPayloadDto): Promise<User | null> {
    return this.findOne(payload.sub);
  }

  private async generateAccessToken(userId: number): Promise<JwtTokenDto> {
    const payload: JwtPayloadDto = {
      sub: userId,
    };

    const response = await this.generateToken(payload, access_token_expires_in);
    return response;
  }

  public async generateRefreshToken(userId: number): Promise<JwtTokenDto> {
    const payload: JwtPayloadDto = {
      sub: userId,
    };

    const response = await this.generateToken(
      payload,
      refresh_token_expires_in,
    );

    await this.setRefreshToken(userId, response.token);

    return response;
  }

  private async generateToken(
    payload: JwtPayloadDto,
    expiresIn: number | string,
  ) {
    return <JwtTokenDto>{
      token: await this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn,
      }),
      expiresIn,
    };
  }

  private async create(createUserDto: CreateUserDto) {
    const user: User = new User();
    user.FirstName = createUserDto.firstName;
    user.LastName = createUserDto.lastName;
    user.Email = createUserDto.email;
    user.Password = createUserDto.password;
    user.CartTotalPrice = 0;

    return await this.repository.save(user);
  }

  private async setRefreshToken(id: number, refreshToken: string) {
    const user = await this.repository.findOneBy({ id });

    user.refreshToken = refreshToken;

    return await this.repository.save(user);
  }

  async findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number) {
    return await this.repository.findOne({
      where: {
        id,
      },
    });
  }

  // async update(id: number, updateUserDto: CreateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // async remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}

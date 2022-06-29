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
import UserProduct from 'src/entities/user-product.entity';
import Product from 'src/entities/product.entity';

const saltRounds = 10;

const access_token_expires_in = 24 * 60 * 60;
const refresh_token_expires_in = 31 * 24 * 60 * 60;

@Injectable()
export class UserService {
  private readonly l = new Logger(UserService.name);

  constructor(private readonly jwtService: JwtService) {}

  @InjectRepository(User)
  private readonly repository: Repository<User>;

  @InjectRepository(Product)
  private readonly repositoryProduct: Repository<Product>;

  @InjectRepository(UserProduct)
  private readonly repositoryUserProduct: Repository<UserProduct>;

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
        accessToken: await this.generateAccessToken(
          createdUser.id,
          createdUser.Email,
          createdUser.FirstName + ' ' + createdUser.LastName,
        ),
        refreshToken: await this.generateRefreshToken(
          createdUser.id,
          createdUser.Email,
          createdUser.FirstName + ' ' + createdUser.LastName,
        ),
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
        accessToken: await this.generateAccessToken(
          user.id,
          user.Email,
          user.FirstName + ' ' + user.LastName,
        ),
        refreshToken: await this.generateRefreshToken(
          user.id,
          user.Email,
          user.FirstName + ' ' + user.LastName,
        ),
      };
    } catch (error) {
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

      return this.generateAccessToken(
        user.id,
        user.Email,
        user.FirstName + ' ' + user.LastName,
      );
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
  }

  public async authUserInfo(userId: number) {
    const dbUser = await this.repository.findOne({
      where: {
        id: userId,
      },
      select: {
        Email: true,
        FirstName: true,
        LastName: true,
      },
    });

    return {
      email: dbUser.Email,
      fullName: dbUser.FirstName + ' ' + dbUser.LastName,
    };
  }

  public async validateJwtUser(payload: JwtPayloadDto): Promise<User | null> {
    return this.findOne(payload.sub);
  }

  private async generateAccessToken(
    userId: number,
    email: string,
    fullName: string,
  ): Promise<JwtTokenDto> {
    const payload: JwtPayloadDto = {
      sub: userId,
      fullName,
      email,
    };

    const response = await this.generateToken(payload, access_token_expires_in);
    return response;
  }

  public async generateRefreshToken(
    userId: number,
    email: string,
    fullName: string,
  ): Promise<JwtTokenDto> {
    const payload: JwtPayloadDto = {
      sub: userId,
      fullName,
      email,
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
    user.CartTotalAmount = 0;

    return await this.repository.save(user);
  }

  private async setRefreshToken(id: number, refreshToken: string) {
    const user = await this.repository.findOneBy({ id });

    user.refreshToken = refreshToken;

    return await this.repository.save(user);
  }

  async findOne(id: number) {
    return await this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async getCart(userId: number) {
    const userProduct = await this.repositoryUserProduct
      .createQueryBuilder('userProduct')
      .innerJoin('userProduct.product', 'product')
      .innerJoin('product.category', 'category')
      .select(
        'product.id AS id, product.name AS name, "soldAmount" AS sold, price, product."imgUrl" AS "imgUrl", quantity',
      )
      .addSelect('category.name', 'categoryName')
      .where('"userId" = :id', { id: userId })
      .getRawMany();

    return {
      products: userProduct,
    };
  }

  async cartAdd(userId: number, productId: number) {
    const product = await this.repositoryProduct.findOne({
      where: {
        id: productId,
      },
    });

    const user = await this.findOne(userId);

    const userProduct = new UserProduct();
    userProduct.user = user;
    userProduct.product = product;
    userProduct.ProductCount = userProduct.ProductCount
      ? userProduct.ProductCount++
      : 1;

    user.CartTotalAmount = user.CartTotalAmount ? user.CartTotalAmount++ : 1;

    user.CartTotalPrice = user.CartTotalPrice
      ? user.CartTotalPrice++
      : product.price;

    product.quantity = product.quantity ? product.quantity++ : 1;

    await this.repositoryProduct.save(product);

    await this.repository.save(user);

    return await this.repositoryUserProduct.save(userProduct);
  }

  async cartProductCount(userId: number, productId: number, sign: string) {
    const product = await this.repositoryProduct.findOne({
      where: {
        id: productId,
      },
    });

    const user = await this.findOne(userId);

    const userProduct = await this.repositoryUserProduct.findOne({
      where: {
        user: user,
        product: product,
      },
    });

    if (sign === '+') {
      console.log('true');

      userProduct.ProductCount += 1;
      user.CartTotalAmount += 1;
      user.CartTotalPrice += product.price;
      product.quantity += 1;
    } else if (sign === '-') {
      console.log('false');
      userProduct.ProductCount -= 1;
      user.CartTotalAmount -= 1;
      user.CartTotalPrice -= product.price;
      product.quantity -= 1;
    }

    await this.repositoryProduct.save(product);

    await this.repository.save(user);

    return await this.repositoryUserProduct.save(userProduct);
  }

  async cartProductDelete(userId: number, productId: number) {
    const product = await this.repositoryProduct.findOne({
      where: {
        id: productId,
      },
    });

    const user = await this.findOne(userId);

    const userProduct = await this.repositoryUserProduct
      .createQueryBuilder('userProduct')
      .where('"userId" = :uid', { uid: userId })
      .andWhere('"productId" = :id', { id: productId })
      .getOne();

    const deleteUserProduct = await this.repositoryUserProduct.delete({
      id: userProduct.id,
    });

    console.log('userProduct.raw[0]: ', deleteUserProduct);

    user.CartTotalAmount -= userProduct.ProductCount;

    user.CartTotalPrice -= userProduct.ProductCount * product.price;

    product.quantity = 0;

    await this.repositoryProduct.save(product);

    await this.repository.save(user);

    return {
      userProduct,
    };
  }

  // async findAll() {
  //   return `This action returns all user`;
  // }
}

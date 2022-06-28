import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Category from 'src/entities/category.entity';
import Product from 'src/entities/product.entity';
import User from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  @InjectRepository(Product)
  private readonly repository: Repository<Product>;

  @InjectRepository(Category)
  private readonly categoryRepository: Repository<Category>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  async home(userId: number | null) {
    const products = await this.repository.find();
    const categories = await this.categoryRepository.find();

    let userCartTotalAmount: number | null = 0;

    if (userId) {
      userCartTotalAmount = (
        await this.userRepository.findOne({
          where: {
            id: userId,
          },
          select: {
            CartTotalAmount: true,
          },
        })
      )?.CartTotalAmount;
    }

    return {
      products,
      categories,
      userCartTotalAmount: userCartTotalAmount ?? 0,
    };
  }

  async create(createProductDto: CreateProductDto) {
    const category = await this.categoryRepository.findOneBy({
      id: createProductDto.categoryId,
    });

    const product: Product = new Product();
    product.name = createProductDto.name;
    product.soldAmount = createProductDto.soldAmount;
    product.price = createProductDto.price;
    product.description = createProductDto.description;
    product.extraInformation = createProductDto.extraInformation;
    product.imgUrl = createProductDto.imgUrl;
    product.category = category;
    product.quantity = 0;

    return await this.repository.save(product);
  }

  async findAll() {
    return await this.repository.find({
      relations: {
        category: true,
      },
    });
  }

  async findOne(id: number) {
    return await this.repository.findOne({
      where: {
        id,
      },
      relations: {
        category: true,
      },
    });
  }

  async update(id: number, updateProductDto: CreateProductDto) {
    const category = await this.categoryRepository.findOneBy({
      id: updateProductDto.categoryId,
    });

    const result = await this.repository
      .createQueryBuilder()
      .update({
        name: updateProductDto.name,
        soldAmount: updateProductDto.soldAmount,
        price: updateProductDto.price,
        description: updateProductDto.description,
        extraInformation: updateProductDto.extraInformation,
        imgUrl: updateProductDto.imgUrl,
        category: category,
      })
      .where({ id })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  async remove(id: number) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where({ id })
      .returning('*')
      .execute();

    return result.raw[0];
  }
}

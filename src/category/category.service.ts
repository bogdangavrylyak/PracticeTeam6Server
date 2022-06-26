import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Category from 'src/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  @InjectRepository(Category)
  private readonly repository: Repository<Category>;

  async create(createCategoryDto: CreateCategoryDto) {
    const category: Category = new Category();
    category.name = createCategoryDto.name;
    category.imgUrl = createCategoryDto.imgUrl;

    return await this.repository.save(category);
  }

  async findAll() {
    return await this.repository.find();
  }

  async findOne(id: number) {
    return await this.repository.findOneBy({ id });
  }

  async update(id: number, updateCategoryDto: CreateCategoryDto) {
    const result = await this.repository
      .createQueryBuilder()
      .update(updateCategoryDto)
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

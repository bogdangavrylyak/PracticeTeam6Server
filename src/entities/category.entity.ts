import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import Product from './product.entity';

@Entity()
class Category {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public imgUrl: string;

  @OneToMany(() => Product, (product: Product) => product.category)
  public products: Product[];
}

export default Category;

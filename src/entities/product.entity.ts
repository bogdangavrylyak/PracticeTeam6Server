import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Category from './category.entity';

@Entity()
class Product {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public soldAmount: number;

  @Column()
  public price: number;

  @Column()
  public description: string;

  @Column()
  public extraInformation: string;

  @Column()
  public imgUrl: string;

  @ManyToOne(() => Category, (category: Category) => category.products, {
    cascade: true,
  })
  public category: Category;

  @Column({
    nullable: true,
  })
  public quantity!: number;
}

export default Product;

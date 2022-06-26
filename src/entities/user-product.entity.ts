import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Product from './product.entity';
import User from './user.entity';

@Entity()
class UserProduct {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public ProductCount: number;

  @OneToOne(() => Product, {
    cascade: true,
  })
  @JoinColumn()
  public product: Product;

  @OneToOne(() => User, {
    cascade: true,
  })
  @JoinColumn()
  public user: User;
}

export default UserProduct;

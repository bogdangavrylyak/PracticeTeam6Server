import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import Product from './product.entity';
import User from './user.entity';

@Entity()
class UserProduct {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public ProductCount: number;

  @OneToOne(() => Product)
  @JoinColumn()
  public product: Product;

  @OneToOne(() => User)
  @JoinColumn()
  public user: User;
}

export default UserProduct;
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public FirstName: string;

  @Column()
  public LastName: string;

  @Column()
  public Email: string;

  @Column()
  public Password: string;

  @Column()
  public CartTotalPrice: number;

  // @OneToOne(() => UserProduct)
  // @JoinColumn()
  // public products: UserProduct;
}

export default User;
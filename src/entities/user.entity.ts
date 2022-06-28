import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public FirstName: string;

  @Column()
  public LastName: string;

  @Column({
    unique: true,
  })
  public Email: string;

  @Column()
  public Password: string;

  @Column({
    unique: true,
    nullable: true,
  })
  public refreshToken!: string | null;

  @Column()
  public CartTotalPrice: number;

  @Column({
    nullable: true,
  })
  public CartTotalAmount!: number;

  // @OneToOne(() => UserProduct)
  // @JoinColumn()
  // public products: UserProduct;
}

export default User;

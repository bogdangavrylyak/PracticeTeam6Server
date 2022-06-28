import { ApiProperty } from '@nestjs/swagger';

export class CartProductCount {
  @ApiProperty()
  productId: number;

  @ApiProperty()
  sign: string;
}

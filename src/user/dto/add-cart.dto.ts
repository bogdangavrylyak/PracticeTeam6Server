import { ApiProperty } from '@nestjs/swagger';

export class AddCartDto {
  @ApiProperty()
  productId: number;
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  soldAmount: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  extraInformation: string;

  @ApiProperty()
  imgUrl: string;

  @ApiProperty()
  categoryId: number;
}

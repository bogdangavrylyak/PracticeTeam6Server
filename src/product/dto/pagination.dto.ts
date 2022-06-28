import { ApiProperty } from '@nestjs/swagger';

export class PaginationData {
  @ApiProperty()
  limit: number;

  @ApiProperty()
  offset: number;
}

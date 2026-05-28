import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdParamDto {
  @ApiProperty({ description: 'MongoDB ObjectId' })
  @IsMongoId({ message: '无效的ID格式' })
  id: string;
}

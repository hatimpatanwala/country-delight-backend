import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  deliveryAddress: string;

  @ApiProperty({ example: '2025-01-15', required: false })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  deliveryDate?: Date;

  @ApiProperty({ example: 'Please ring doorbell', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

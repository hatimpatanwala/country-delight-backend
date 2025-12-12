import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserSubscriptionDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Subscription plan ID' })
  @IsMongoId()
  plan: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'Delivery address ID' })
  @IsMongoId()
  deliveryAddress: string;

  @ApiProperty({ example: '2025-01-01', description: 'Start date', required: false })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;
}

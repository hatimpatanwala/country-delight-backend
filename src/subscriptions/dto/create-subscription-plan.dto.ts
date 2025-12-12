import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsMongoId, IsEnum, Min } from 'class-validator';
import { SubscriptionType } from '../schemas/subscription-plan.schema';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ example: 'Daily Milk Subscription', description: 'Plan name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Get fresh milk delivered daily', description: 'Plan description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Product ID' })
  @IsMongoId()
  product: string;

  @ApiProperty({ enum: SubscriptionType, example: SubscriptionType.DAILY })
  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @ApiProperty({ example: 1, description: 'Quantity per delivery' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 60, description: 'Price per unit' })
  @IsNumber()
  @Min(0)
  pricePerUnit: number;

  @ApiProperty({ example: 1800, description: 'Total price for subscription period' })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiProperty({ example: 10, description: 'Discount percentage', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountPercentage?: number;

  @ApiProperty({ example: [1, 3, 5], description: 'Delivery days (0-6 for Sun-Sat)', required: false })
  @IsArray()
  @IsOptional()
  deliveryDays?: number[];

  @ApiProperty({ example: 30, description: 'Subscription duration in days' })
  @IsNumber()
  @Min(1)
  duration: number;
}

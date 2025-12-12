import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsMongoId, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Full Cream Milk', description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Fresh full cream milk delivered daily', description: 'Product description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Category ID' })
  @IsMongoId()
  category: string;

  @ApiProperty({ example: 65, description: 'Product price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 60, description: 'Discounted price', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountedPrice?: number;

  @ApiProperty({ example: '1L', description: 'Product unit' })
  @IsString()
  unit: string;

  @ApiProperty({ example: ['https://example.com/milk.jpg'], description: 'Product images', required: false })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiProperty({ example: true, description: 'Is product available', required: false })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ example: 100, description: 'Stock quantity', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  stockQuantity?: number;

  @ApiProperty({ example: ['dairy', 'fresh'], description: 'Product tags', required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: false, description: 'Is featured product', required: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Milk', description: 'Category name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Fresh milk and dairy products', description: 'Category description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/milk.jpg', description: 'Category image URL', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: true, description: 'Is category active', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 1, description: 'Display order', required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  order?: number;
}

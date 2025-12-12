import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, Matches } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(/^[6-9]\d{9}$/)
  phone: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  addressLine1: string;

  @ApiProperty({ example: 'Near Park', required: false })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  state: string;

  @ApiProperty({ example: '400001' })
  @IsString()
  pincode: string;

  @ApiProperty({ example: 'Near XYZ Mall', required: false })
  @IsString()
  @IsOptional()
  landmark?: string;

  @ApiProperty({ example: 'home', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

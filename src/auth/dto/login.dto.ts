import { IsString, IsEmail, MinLength, IsOptional, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Phone must be a valid 10-digit Indian mobile number' })
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  password: string;
}

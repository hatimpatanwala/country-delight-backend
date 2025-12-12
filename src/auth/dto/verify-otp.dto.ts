import { IsString, Matches, Length, IsOptional } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Phone must be a valid 10-digit Indian mobile number' })
  phone: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

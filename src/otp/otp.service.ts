import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from './schemas/otp.schema';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 5;

  constructor(@InjectModel(Otp.name) private otpModel: Model<OtpDocument>) {}

  private generateOtp(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateAndSave(phone: string): Promise<string> {
    // Delete any existing OTPs for this phone
    await this.otpModel.deleteMany({ phone });

    const otp = this.generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    await this.otpModel.create({
      phone,
      otp,
      expiresAt,
    });

    // In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
    console.log(`📱 OTP for ${phone}: ${otp}`);

    return otp; // In production, don't return OTP, just return success message
  }

  async verify(phone: string, otp: string): Promise<boolean> {
    const otpRecord = await this.otpModel.findOne({
      phone,
      isVerified: false,
    });

    if (!otpRecord) {
      throw new BadRequestException('OTP not found or already verified');
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await this.otpModel.deleteOne({ _id: otpRecord._id });
      throw new BadRequestException('OTP has expired');
    }

    // Check attempts
    if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
      await this.otpModel.deleteOne({ _id: otpRecord._id });
      throw new BadRequestException('Maximum verification attempts exceeded');
    }

    // Increment attempts
    otpRecord.attempts += 1;
    await otpRecord.save();

    // Verify OTP
    if (otpRecord.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Mark as verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    return true;
  }

  async cleanup(phone: string): Promise<void> {
    await this.otpModel.deleteMany({ phone });
  }
}

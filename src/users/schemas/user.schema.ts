import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  phone: string;

  @Prop({ unique: true, sparse: true, trim: true, lowercase: true })
  email?: string;

  @Prop()
  password?: string;

  @Prop({ trim: true })
  firstName?: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ type: String, enum: UserRole, required: true })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  refreshToken?: string;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ type: Object })
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for faster queries
UserSchema.index({ phone: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

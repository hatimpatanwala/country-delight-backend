import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserSubscriptionDocument = UserSubscription & Document;

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class UserSubscription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SubscriptionPlan', required: true })
  plan: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Address', required: true })
  deliveryAddress: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: String, enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  pausedFrom?: Date;

  @Prop()
  pausedUntil?: Date;

  @Prop({ type: [Date], default: [] })
  skippedDeliveries: Date[];

  @Prop()
  cancelledAt?: Date;

  @Prop()
  cancellationReason?: string;
}

export const UserSubscriptionSchema = SchemaFactory.createForClass(UserSubscription);

UserSubscriptionSchema.index({ user: 1, status: 1 });
UserSubscriptionSchema.index({ startDate: 1, endDate: 1 });

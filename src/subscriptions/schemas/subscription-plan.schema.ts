import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriptionPlanDocument = SubscriptionPlan & Document;

export enum SubscriptionType {
  DAILY = 'daily',
  ALTERNATE_DAYS = 'alternate_days',
  WEEKLY = 'weekly',
  CUSTOM = 'custom',
}

@Schema({ timestamps: true })
export class SubscriptionPlan {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: String, enum: SubscriptionType, required: true })
  type: SubscriptionType;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  pricePerUnit: number;

  @Prop({ required: true })
  totalPrice: number;

  @Prop()
  discountPercentage?: number;

  @Prop({ type: [Number], default: [] })
  deliveryDays?: number[]; // 0-6 (Sunday-Saturday) for weekly/custom

  @Prop({ required: true })
  duration: number; // in days

  @Prop({ default: true })
  isActive: boolean;
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);

SubscriptionPlanSchema.index({ product: 1, type: 1 });
SubscriptionPlanSchema.index({ isActive: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  discountedPrice?: number;

  @Prop({ required: true })
  unit: string; // e.g., "1L", "500ml", "1kg", "500g"

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  stockQuantity: number;

  @Prop({ type: Object })
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
    fiber?: number;
  };

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1, isAvailable: 1 });
ProductSchema.index({ isFeatured: 1 });

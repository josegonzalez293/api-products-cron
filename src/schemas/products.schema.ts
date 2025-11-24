import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Products {
  @Prop({ required: true, unique: true }) externalId: string;
  @Prop({ required: true }) name: string;
  @Prop({ type: String }) category?: string;
  @Prop({ type: Number, default: null }) price?: number | null;
  @Prop({ type: Object, default: {} }) metadata?: any;
  @Prop({ type: Number, default: null }) sku?: any;
  @Prop({ type: String, default: null }) brand?: any;
  @Prop({ type: String, default: null }) model?: any;
  @Prop({ type: String, default: null }) color?: any;
  @Prop({ type: String, default: null }) currency?: any;
  @Prop({ type: Number, default: null }) stock?: any;
  @Prop({ default: false }) deleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt?: Date | null;
  @Prop({ type: Date, default: null }) createdAt?: Date | null;
  @Prop({ type: Date, default: null }) updatedAt?: Date | null;
  @Prop({ type: Date, default: null }) lastSyncedAt?: Date | null;
}

export const ProductSchema = SchemaFactory.createForClass(Products);

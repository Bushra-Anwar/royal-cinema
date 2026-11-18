import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConcessionItemDocument = ConcessionItem & Document;

@Schema({ timestamps: true, collection: 'concession_items' })
export class ConcessionItem {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  name: string; // e.g. "Caramel Popcorn XL Tub"

  @Prop({ required: true, enum: ['POPCORN', 'BEVERAGES', 'HOT_SNACKS', 'COMBOS', 'DESSERTS'] })
  category: string;

  @Prop({ required: true })
  sellingPrice: number;

  @Prop({ required: true, default: 0 })
  currentStock: number;

  @Prop({ required: true, default: 2 })
  lowStockThreshold: number; // Alerts cashier when <= threshold

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: 2.5 })
  cgstRate: number; // 2.5%

  @Prop({ default: 2.5 })
  sgstRate: number; // 2.5%
}

export const ConcessionItemSchema = SchemaFactory.createForClass(ConcessionItem);
ConcessionItemSchema.index({ tenantId: 1, category: 1 });

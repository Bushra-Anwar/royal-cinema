import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Invoice extends Document {
  @Prop({ required: true, index: true })
  organizationId: string;

  @Prop({ required: true })
  branchId: string;

  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: '999632' })
  sacCode: string;

  @Prop({ default: 'PAID' })
  status: string;

  @Prop()
  pdfUrl: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true })
export class SubscriptionPlan {
  @Prop({ required: true, default: 'Enterprise Cinema ERP & POS Cloud Service' })
  planName: string;

  @Prop({ required: true, default: '₹25,000' })
  amountPaid: string;

  @Prop({ required: true })
  paidDate: string;

  @Prop({ required: true })
  validTill: string;

  @Prop({ required: true })
  nextDueDate: string;

  @Prop({ required: true, default: 'Yearly / Annual' })
  billingCycle: string;

  @Prop({ default: 'UPI / Bank Transfer' })
  paymentMethod: string;

  @Prop({ required: true, enum: ['Active', 'Due Soon', 'Overdue'], default: 'Active' })
  status: string;
}

const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);

@Schema({ timestamps: true, collection: 'tenants' })
export class Tenant {
  @Prop({ required: true, unique: true, index: true })
  tenantCode: string; // e.g. "pal-flagship", "surat-multiplex"

  @Prop({ required: true })
  name: string; // e.g. "Royal Cinema — Palanpur Flagship"

  @Prop({ required: true, enum: ['cinema', 'multiplex', 'theatre', 'concession_shop'], default: 'cinema' })
  type: string;

  @Prop({ required: true, unique: true, index: true })
  adminEmail: string;

  @Prop({ required: true, unique: true, index: true })
  adminUsername: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '24AAACR1234F1Z9' })
  gstin: string;

  @Prop({ type: SubscriptionPlanSchema, required: true })
  subscription: SubscriptionPlan;

  @Prop({ required: true, enum: ['active', 'suspended', 'trial'], default: 'active' })
  status: string;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
TenantSchema.index({ adminEmail: 1, adminUsername: 1 });

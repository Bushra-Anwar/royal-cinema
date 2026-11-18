import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ required: true, index: true })
  organizationId: string;

  @Prop({ required: true, unique: true, index: true })
  branchId: string;

  @Prop({ required: true })
  planId: string;

  @Prop({ required: true })
  billingCycle: string; // 'monthly' | 'yearly'

  @Prop({ required: true })
  validTill: Date;

  @Prop({ default: 'active' })
  status: string; // 'active' | 'grace_period' | 'expired' | 'suspended'

  @Prop({ default: 3 })
  gracePeriodDays: number;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
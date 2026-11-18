import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Plan extends Document {
  @Prop({ required: true, unique: true })
  planId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  screensAllowed: number;

  @Prop({ required: true })
  monthlyPrice: number;

  @Prop({ required: true })
  yearlyPrice: number;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
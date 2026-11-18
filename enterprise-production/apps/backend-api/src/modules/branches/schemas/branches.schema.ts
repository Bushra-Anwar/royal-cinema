import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Branch extends Document {
  @Prop({ required: true, index: true })
  organizationId: string;

  @Prop({ required: true, unique: true })
  branchId: string;

  @Prop({ required: true })
  branchName: string;

  @Prop({ required: true })
  city: string;

  @Prop({ default: 1 })
  screensCount: number;

  @Prop({ default: 'active' })
  status: string;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
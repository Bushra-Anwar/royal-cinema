import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Organization extends Document {
  @Prop({ required: true, unique: true })
  organizationId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  ownerEmail: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop()
  gstin: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
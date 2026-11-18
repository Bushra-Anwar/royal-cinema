import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class License extends Document {
  @Prop({ required: true, index: true })
  organizationId: string;

  @Prop({ required: true, index: true })
  branchId: string;

  @Prop({ required: true, unique: true })
  licenseKey: string;

  @Prop({ default: 2 })
  devicesLimit: number;

  @Prop({ type: [String], default: [] })
  activatedDeviceHashes: string[];
}

export const LicenseSchema = SchemaFactory.createForClass(License);
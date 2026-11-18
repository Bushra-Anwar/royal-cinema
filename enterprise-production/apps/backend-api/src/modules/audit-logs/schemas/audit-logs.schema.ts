import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true, index: true })
  actorId: string;

  @Prop({ required: true })
  actorName: string;

  @Prop({ required: true, index: true })
  action: string;

  @Prop()
  targetResource: string;

  @Prop({ type: Object })
  details: any;

  @Prop()
  ipAddress: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
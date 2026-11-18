import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  channelsDispatched: { dashboard: boolean; email: boolean; whatsapp: boolean };
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
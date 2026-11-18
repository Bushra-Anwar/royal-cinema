import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SupportTicket extends Document {
  @Prop({ required: true, index: true })
  organizationId: string;

  @Prop({ required: true })
  branchId: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['Low', 'Medium', 'High', 'Critical'] })
  priority: string;

  @Prop({ default: 'Open' })
  status: string;

  @Prop()
  assignedAgentId: string;

  @Prop()
  slaTargetMinutes: number; // Critical: 15, High: 60, Medium: 240, Low: 1440
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);
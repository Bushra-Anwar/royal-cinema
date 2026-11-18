import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true, collection: 'bookings' })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  bookingReference: string; // e.g. "RC-PAL-88912"

  @Prop({ required: true })
  movieTitle: string;

  @Prop({ required: true })
  screenName: string; // e.g. "Audi 1"

  @Prop({ required: true })
  screenTechnology: string; // e.g. "Dolby Atmos 7.1 + 4K Laser"

  @Prop({ required: true })
  showTime: string;

  @Prop({ required: true })
  showDate: string;

  @Prop({ type: [String], required: true })
  seatCodes: string[]; // e.g. ["B4", "B5"]

  @Prop({ required: true })
  ticketCount: number;

  @Prop({ required: true })
  baseAmount: number;

  @Prop({ default: 0 })
  convenienceFee: number;

  @Prop({ required: true })
  cgst: number; // Central GST

  @Prop({ required: true })
  sgst: number; // State GST

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true, enum: ['UPI', 'CASH', 'CARD', 'RAZORPAY', 'STRIPE'] })
  paymentMode: string;

  @Prop({ default: '' })
  paymentTransactionId: string;

  @Prop({ required: true, enum: ['BOX_OFFICE_POS', 'CUSTOMER_MOBILE_APP', 'KIOSK'] })
  bookingChannel: string;

  @Prop({ default: '' })
  customerName: string;

  @Prop({ default: '' })
  customerMobile: string;

  @Prop({ default: '' })
  qrCodeUrl: string;

  @Prop({ required: true, enum: ['CONFIRMED', 'CANCELLED', 'CHECKED_IN'], default: 'CONFIRMED' })
  status: string;

  @Prop({ default: false })
  gateScanned: boolean;

  @Prop()
  scannedAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ tenantId: 1, showDate: 1, showTime: 1 });
BookingSchema.index({ bookingReference: 1 });

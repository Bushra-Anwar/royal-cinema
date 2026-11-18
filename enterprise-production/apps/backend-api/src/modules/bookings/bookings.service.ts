import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async createBooking(dto: CreateBookingDto, tenantIdStr?: string) {
    if (!dto.seatCodes || dto.seatCodes.length === 0) {
      throw new BadRequestException('At least one seat must be selected to issue tickets.');
    }

    const tenantId = tenantIdStr ? new Types.ObjectId(tenantIdStr) : new Types.ObjectId();

    // Verify seat collision
    const existing = await this.bookingModel.findOne({
      tenantId,
      showDate: dto.showDate,
      showTime: dto.showTime,
      screenName: dto.screenName,
      seatCodes: { $in: dto.seatCodes },
      status: 'CONFIRMED',
    });

    if (existing) {
      throw new BadRequestException('One or more selected seats have already been booked by another terminal.');
    }

    const ref = 'RC-' + Math.floor(1000 + Math.random() * 9000);
    const halfGst = +(dto.gstTotal / 2).toFixed(2);

    const booking = new this.bookingModel({
      tenantId,
      bookingReference: ref,
      movieTitle: dto.movieTitle,
      screenName: dto.screenName,
      screenTechnology: dto.screenTechnology || 'Dolby Atmos 7.1 + 4K Laser',
      showTime: dto.showTime,
      showDate: dto.showDate,
      seatCodes: dto.seatCodes,
      ticketCount: dto.seatCodes.length,
      baseAmount: dto.baseAmount,
      convenienceFee: 15.0,
      cgst: halfGst,
      sgst: halfGst,
      totalAmount: dto.totalAmount,
      paymentMode: dto.paymentMode,
      bookingChannel: dto.bookingChannel,
      customerName: dto.customerName || 'Walk-in Guest',
      status: 'CONFIRMED',
      gateScanned: false,
    });

    await booking.save();

    return {
      success: true,
      message: 'Tickets confirmed & recorded in Owner Ledger',
      booking: {
        id: booking._id,
        reference: booking.bookingReference,
        movieTitle: booking.movieTitle,
        screenName: booking.screenName,
        showTime: booking.showTime,
        seats: booking.seatCodes,
        totalAmount: booking.totalAmount,
        paymentMode: booking.paymentMode,
        createdAt: booking.createdAt,
      },
    };
  }

  async getRecentBookings(tenantIdStr?: string) {
    const filter = tenantIdStr ? { tenantId: new Types.ObjectId(tenantIdStr) } : {};
    return this.bookingModel.find(filter).sort({ createdAt: -1 }).limit(50).exec();
  }
}

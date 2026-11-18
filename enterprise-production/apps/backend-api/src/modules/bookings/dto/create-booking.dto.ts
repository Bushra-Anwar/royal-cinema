import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'DEADPOOL & WOLVERINE', description: 'Movie title' })
  @IsNotEmpty()
  @IsString()
  movieTitle: string;

  @ApiProperty({ example: 'Audi 1', description: 'Screen name' })
  @IsNotEmpty()
  @IsString()
  screenName: string;

  @ApiProperty({ example: 'Dolby Atmos 7.1 + 4K Laser' })
  @IsOptional()
  @IsString()
  screenTechnology?: string;

  @ApiProperty({ example: '09:30 PM' })
  @IsNotEmpty()
  @IsString()
  showTime: string;

  @ApiProperty({ example: '2026-11-15' })
  @IsNotEmpty()
  @IsString()
  showDate: string;

  @ApiProperty({ example: ['B4', 'B5'], description: 'List of confirmed seat identifiers' })
  @IsNotEmpty()
  @IsArray()
  seatCodes: string[];

  @ApiProperty({ example: 400.0, description: 'Base ticket subtotal' })
  @IsNotEmpty()
  @IsNumber()
  baseAmount: number;

  @ApiProperty({ example: 42.5, description: 'Total GST (CGST + SGST)' })
  @IsNotEmpty()
  @IsNumber()
  gstTotal: number;

  @ApiProperty({ example: 442.5, description: 'Total payable amount' })
  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ example: 'UPI', enum: ['UPI', 'CASH', 'CARD', 'RAZORPAY', 'STRIPE'] })
  @IsNotEmpty()
  @IsString()
  paymentMode: string;

  @ApiProperty({ example: 'BOX_OFFICE_POS', enum: ['BOX_OFFICE_POS', 'CUSTOMER_MOBILE_APP'] })
  @IsNotEmpty()
  @IsString()
  bookingChannel: string;

  @ApiProperty({ example: 'Aarav Patel', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;
}

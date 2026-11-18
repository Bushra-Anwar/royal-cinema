import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CognitoAuthGuard } from '../../common/guards/cognito-auth.guard';
import { CurrentTenant } from '../../common/decorators/roles.decorator';

@ApiTags('Bookings & Admissions')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('confirm')
  @ApiOperation({
    summary: 'Confirm Theatrical Ticket Booking',
    description: 'Issues admission pass, deducts seat occupancy, records GST, and returns ticket slip payload.',
  })
  @ApiResponse({ status: 201, description: 'Booking confirmed successfully.' })
  async confirmBooking(@Body() dto: CreateBookingDto, @CurrentTenant() tenantId: string) {
    return this.bookingsService.createBooking(dto, tenantId);
  }

  @Get('recent')
  @ApiBearerAuth('JWT-Auth')
  @UseGuards(CognitoAuthGuard)
  @ApiOperation({ summary: 'List Recent Bookings for Box Office Ledger' })
  async getRecent(@CurrentTenant() tenantId: string) {
    return this.bookingsService.getRecentBookings(tenantId);
  }
}

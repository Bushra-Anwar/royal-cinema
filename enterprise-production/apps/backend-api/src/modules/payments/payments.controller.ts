import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Razorpay / Stripe Payment Gateway Order' })
  @ApiResponse({ status: 200, description: 'Order created with key and order ID.' })
  async createOrder(@Body() body: { amount: number; receiptRef: string }) {
    return this.paymentsService.createRazorpayOrder(body.amount, body.receiptRef);
  }

  @Post('webhook/razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay Webhook for Payment Captures' })
  async handleRazorpayWebhook(@Body() payload: any) {
    return { status: 'received' };
  }
}

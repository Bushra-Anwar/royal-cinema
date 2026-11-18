import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private configService: ConfigService) {}

  async createRazorpayOrder(amount: number, receiptRef: string) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    return {
      gateway: 'RAZORPAY',
      orderId: 'order_' + crypto.randomBytes(8).toString('hex'),
      amount: amountInPaise,
      currency: 'INR',
      keyId: keyId || 'rzp_test_placeholder',
      receipt: receiptRef,
      status: 'created',
    };
  }

  async verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'example_secret';
    const text = orderId + '|' + paymentId;
    const generated = crypto.createHmac('sha256', secret).update(text).digest('hex');
    return generated === signature;
  }
}

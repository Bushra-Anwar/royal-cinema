import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Galaxy Cinema — Ahmedabad', description: 'Name of the cinema client or shop' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'cinema', enum: ['cinema', 'multiplex', 'concession_shop'], default: 'cinema' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: 'galaxy_admin', description: 'Username for the cinema administrator' })
  @IsNotEmpty()
  @IsString()
  adminUsername: string;

  @ApiProperty({ example: 'admin@galaxycinema.in', description: 'Official email for the cinema client' })
  @IsNotEmpty()
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ example: 'Galaxy@Pass2026', description: 'Initial admin password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  adminPassword: string;

  @ApiProperty({ example: '₹25,000', description: 'Subscription amount paid' })
  @IsNotEmpty()
  @IsString()
  amountPaid: string;

  @ApiProperty({ example: '2026-11-15', description: 'Payment date' })
  @IsNotEmpty()
  @IsString()
  paidDate: string;

  @ApiProperty({ example: '2027-11-15', description: 'Subscription valid till' })
  @IsNotEmpty()
  @IsString()
  validTill: string;

  @ApiProperty({ example: 'Yearly / Annual', default: 'Yearly / Annual' })
  @IsOptional()
  @IsString()
  billingCycle?: string;

  @ApiProperty({ example: 'UPI / Bank Transfer (Ref: TXN-4921)', default: 'UPI / Bank Transfer' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

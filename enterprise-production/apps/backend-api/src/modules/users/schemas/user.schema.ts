import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: false, index: true })
  tenantId?: Types.ObjectId; // null for Super Admin

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop({ enum: ['ticket', 'food', 'manager', 'none'], default: 'none' })
  counterStation: string;

  @Prop({ default: '' })
  cognitoSub?: string; // AWS Cognito User ID when Cognito Auth is active

  @Prop({ required: true, enum: ['active', 'suspended', 'pending'], default: 'active' })
  status: string;

  @Prop({ default: Date.now })
  lastLoginAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ tenantId: 1, role: 1 });
UserSchema.index({ username: 1, email: 1 });

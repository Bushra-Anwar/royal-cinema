
export interface Organization {
  id: string;
  name: string;
  ownerEmail: string;
  phone: string;
  gstin?: string;
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  city: string;
  state: string;
  screensCount: number;
  status: 'active' | 'expired' | 'suspended';
  subscription: BranchSubscription;
}

export interface BranchSubscription {
  planId: 'starter' | 'professional' | 'enterprise';
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  validTill: string;
  status: 'active' | 'grace_period' | 'expired';
  daysRemaining: number;
  devicesLimit: number;
}

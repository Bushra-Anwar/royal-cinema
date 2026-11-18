/**
 * Data Synchronization & Offline Seat Lease Contract (Section 21)
 * Enforces clean separation between cinema operational data & SaaS management records,
 * and guarantees zero double-booking during internet disruption.
 */

export interface SeatLeaseRequest {
  organizationId: string;
  branchId: string;
  showId: string;
  deviceId: string;
  requestedSeats: string[];
}

export interface SeatLeaseResponse {
  ok: boolean;
  showKey: string;
  allocated: string[];
  conflicts: Array<{ seat: string; leasedBy: string; expiresAt: number }>;
  leaseValidTill: string;
}

export interface OfflineJournalEntry {
  journalId: string;
  organizationId: string;
  branchId: string;
  deviceId: string;
  bookingData: {
    bookingId: string;
    movie: string;
    showTime: string;
    seats: string[];
    totalAmount: number;
    paymentMethod: string;
  };
  synced: boolean;
  recordedOfflineAt: string;
  syncedAt?: string;
}

export interface TenantContextResolution {
  ok: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  organization: {
    id: string;
    name: string;
    status: 'active' | 'suspended';
  };
  branches: Array<{
    branchId: string;
    branchName: string;
    city: string;
    screensCount: number;
    status: 'active' | 'expired';
    subscription: {
      planName: string;
      billingCycle: string;
      validTill: string;
      isExpired: boolean;
      devicesLimit: number;
    };
  }>;
  activeBranchesCount: number;
  expiredBranchesCount: number;
}

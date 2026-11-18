
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface SupportTicket {
  id: string;
  organizationId: string;
  branchId: string;
  branchName: string;
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  slaTargetMinutes: number;
  requesterName: string;
  requesterPhone: string;
  createdAt: string;
  replies: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  author: string;
  authorRole: 'client' | 'support_agent' | 'super_admin';
  message: string;
  timestamp: string;
}

export interface Session {
    id?: string;
    consoleId: string;
    startTime: number;
    endTime?: number;
    cost: number;
    status: 'active' | 'completed';
    customerIds: string[]; // Array of customer IDs
    playerQty: number; // Total players
    paymentStatus?: 'PENDING' | 'PAID';
  }
export interface Order {
    id?: string;
    sessionId: string;
    item: string;
    cost: number;
    status: 'pending' | 'delivered';
  }
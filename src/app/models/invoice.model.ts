import { Order } from "./order.model";

// export interface Invoice {
//     id: string;
//     sessionId: string;
//     customerIds: string[];
//     totalAmount: number;
//     loyaltyPointsUsed: number;
//     payableAmount: number;
//     paymentMethod: 'CASH' | 'CARD' | 'UPI';
//     timestamp: number;
//     orders?: Order[];
//   }
export interface Invoice {
    id: string; // Unique invoice ID
    sessionId: string;
    customerIds: string[];
    totalAmount: number; // Before discounts/points
    loyaltyPointsUsed: number;
    discountApplied: number; // From subscription or additional discounts
    payableAmount: number; // Final amount after all adjustments
    paymentMethod: 'CASH' | 'CARD' | 'UPI';
    paymentStatus: 'PENDING' | 'COMPLETED';
    transactionId?: string; // Optional, for CARD/UPI
    timestamp: number; // Payment completion time
    orders?: Order[];
  }
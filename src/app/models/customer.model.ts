export interface Customer {
    id: string;
    name: string;
    subscription: 'basic' | 'premium' | 'none'; // Subscription type
    totalSpent: number;
    loyaltyPoints: number; // Points earned (e.g., 1 point per 10 INR)
    additionalDiscount: number; // Custom discount (e.g., 0.1 for 10%)
  }
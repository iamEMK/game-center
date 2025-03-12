export interface Console {
    id: string;
    name: string;
    status: 'free' | 'occupied';
    zone: 'VIP' | 'standard';
  }
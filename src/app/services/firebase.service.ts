
import { Injectable, signal, OnDestroy, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  addDoc, 
  updateDoc, 
  setDoc,
  docData,
  query, 
  where,
  limit,
  DocumentReference,
  orderBy,
  startAfter
} from '@angular/fire/firestore';
import { map, Observable, Subscription } from 'rxjs';
import { Console } from '../models/console.model';
import { Session } from '../models/session.model';
import { Order } from '../models/order.model';
import { Customer } from '../models/customer.model';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService implements OnDestroy {
  consoles = signal<Console[]>([]);
  sessions = signal<Session[]>([]);
  orders = signal<Order[]>([]);
  customers = signal<Customer[]>([]);
  invoices = signal<Invoice[]>([]);

  private subscriptions: Subscription[] = [];
  private firestore: Firestore = inject(Firestore);
  
  constructor() {
    this.loadInitialData();
  }
  
  private loadInitialData() {
    const consolesCollection = collection(this.firestore, 'consoles');
    const sessionsCollection = collection(this.firestore, 'sessions');
    const ordersCollection = collection(this.firestore, 'orders');
    const customersCollection = collection(this.firestore, 'customers');
    const invoicesCollection = collection(this.firestore, 'invoices')
    
    this.subscriptions.push(
      collectionData(consolesCollection, { idField: 'id' })
        .subscribe(data => this.consoles.set(data as Console[])),
      collectionData(sessionsCollection, { idField: 'id' })
        .subscribe(data => this.sessions.set(data as Session[])),
      collectionData(ordersCollection, { idField: 'id' })
        .subscribe(data => this.orders.set(data as Order[])),
      collectionData(customersCollection, { idField: 'id' })
        .subscribe(data => this.customers.set(data as Customer[])),
        collectionData(invoicesCollection, { idField: 'id' })
      .subscribe(data => this.invoices.set(data as Invoice[]))
    );
  }
  
  // New method for sales report
  getSalesReport(fromDate: number, toDate: number): Observable<{ sessions: Session[], totalEarnings: number }> {
    const sessionsCollection = collection(this.firestore, 'sessions');
    const dateQuery = query(
      sessionsCollection,
      where('startTime', '>=', fromDate),
      where('startTime', '<=', toDate),
      where('status', '==', 'completed') // Only completed sessions contribute to earnings
    );
    
    return collectionData(dateQuery, { idField: 'id' }).pipe(
      map(sessions => {
        const completedSessions = sessions as Session[];
        const totalEarnings = completedSessions.reduce((sum, s) => sum + (s.cost || 0), 0);
        return { sessions: completedSessions, totalEarnings };
      })
    );
  }

  createConsole(consoleData: Console): Promise<DocumentReference> {
    const consolesCollection = collection(this.firestore, 'consoles');
    return addDoc(consolesCollection, consoleData);
  }

  updateConsoleStatus(id: string, status: 'free' | 'occupied'): Promise<void> {
    const consoleDoc = doc(this.firestore, `consoles/${id}`);
    return updateDoc(consoleDoc, { status });
  }

  createSession(session: Session): Promise<DocumentReference> {
    const sessionsCollection = collection(this.firestore, 'sessions');
    return addDoc(sessionsCollection, session);
  }
  
  updateSession(id: string, session: Partial<Session>): Promise<void> {
    const sessionDoc = doc(this.firestore, `sessions/${id}`);
    return updateDoc(sessionDoc, session);
  }
  
  createOrder(order: Order): Promise<DocumentReference> {
    const ordersCollection = collection(this.firestore, 'orders');
    return addDoc(ordersCollection, order);
  }
  
  createCustomer(customer: Customer): Promise<void> {
    const customerDoc = doc(this.firestore, `customers/${customer.id}`);
    return setDoc(customerDoc, customer);
  }
  
  updateCustomer(id: string, customer: Partial<Customer>): Promise<void> {
    const customerDoc = doc(this.firestore, `customers/${id}`);
    return updateDoc(customerDoc, customer);
  }
  
  getTotalRevenue(): Observable<number> {
    const sessionsCollection = collection(this.firestore, 'sessions');
    return collectionData(sessionsCollection)
      .pipe(map(sessions => (sessions as Session[]).reduce((sum, s) => sum + (s.cost || 0), 0)));
  }
  
  getActiveConsoles(): Observable<Console[]> {
    const consolesCollection = collection(this.firestore, 'consoles');
    const activeConsolesQuery = query(consolesCollection, where('status', '==', 'occupied'));
    return collectionData(activeConsolesQuery, { idField: 'id' }) as Observable<Console[]>;
  }
  
  getConsole(id: string): Observable<Console> {
    const consoleDoc = doc(this.firestore, `consoles/${id}`);
    return docData(consoleDoc, { idField: 'id' }) as Observable<Console>;
  }
  getPaginatedCustomers(limitq: number, lastDoc?: any): Observable<{ customers: Customer[], lastDoc: any }> {
    const customersCollection = collection(this.firestore, 'customers');
    let q = query(customersCollection, orderBy('name'), limit(limitq));
    if (lastDoc) {
      q = query(customersCollection, orderBy('name'), startAfter(lastDoc), limit(limitq));
    }
    return collectionData(q, { idField: 'id' }).pipe(
      map(customers => ({ customers: customers as Customer[], lastDoc: customers.length ? customers[customers.length - 1] : null }))
    );
  }
  
  // Filter customers by name or subscription
  getFilteredCustomers(filter: string, field: 'name' | 'subscription' = 'name'): Observable<Customer[]> {
    const customersCollection = collection(this.firestore, 'customers');
    const q = query(customersCollection, where(field, '>=', filter), where(field, '<=', filter + '\uf8ff'));
    return collectionData(q, { idField: 'id' }) as Observable<Customer[]>;
  }
  // Add these to the existing FirebaseService class

// // Save invoice with payment details
// createInvoice(invoice: Invoice): Promise<void> {
//   const invoiceDoc = doc(this.firestore, `invoices/${invoice.id}`);
//   return setDoc(invoiceDoc, invoice);
// }

// // Update customer loyalty points
// updateCustomerLoyaltyPoints(id: string, points: number): Promise<void> {
//   const customerDoc = doc(this.firestore, `customers/${id}`);
//   return updateDoc(customerDoc, { loyaltyPoints: points });
// }
  
// Save invoice
createInvoice(invoice: Invoice): Promise<void> {
  const invoiceDoc = doc(this.firestore, `invoices/${invoice.id}`);
  return setDoc(invoiceDoc, invoice);
}

// Update customer's loyalty points
updateLoyaltyPoints(customerId: string, points: number): Promise<void> {
  const customerDoc = doc(this.firestore, `customers/${customerId}`);
  return updateDoc(customerDoc, { loyaltyPoints: points });
}
// Get pending payment sessions
getPendingPayments(): Observable<Session[]> {
  const sessionsCollection = collection(this.firestore, 'sessions');
  const pendingQuery = query(
    sessionsCollection,
    where('status', '==', 'completed'),
    where('paymentStatus', '==', 'PENDING')
  );
  return collectionData(pendingQuery, { idField: 'id' }) as Observable<Session[]>;
}
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
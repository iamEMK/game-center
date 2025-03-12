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
  DocumentReference
} from '@angular/fire/firestore';
import { map, Observable, Subscription } from 'rxjs';
import { Console } from '../models/console.model';
import { Session } from '../models/session.model';
import { Order } from '../models/order.model';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService implements OnDestroy {
  // Signals for reactive state
  consoles = signal<Console[]>([]);
  sessions = signal<Session[]>([]);
  orders = signal<Order[]>([]);
  customers = signal<Customer[]>([]);
  
  private subscriptions: Subscription[] = [];
  private firestore: Firestore = inject(Firestore);
  
  constructor() {
    this.loadInitialData();
  }
  
  private loadInitialData() {
    // Collection references
    const consolesCollection = collection(this.firestore, 'consoles');
    const sessionsCollection = collection(this.firestore, 'sessions');
    const ordersCollection = collection(this.firestore, 'orders');
    const customersCollection = collection(this.firestore, 'customers');
    
    // Set up streams and connect to signals
    this.subscriptions.push(
      collectionData(consolesCollection, { idField: 'id' })
        .subscribe(data => this.consoles.set(data as Console[])),
      
      collectionData(sessionsCollection, { idField: 'id' })
        .subscribe(data => this.sessions.set(data as Session[])),
      
      collectionData(ordersCollection, { idField: 'id' })
        .subscribe(data => this.orders.set(data as Order[])),
      
      collectionData(customersCollection, { idField: 'id' })
        .subscribe(data => this.customers.set(data as Customer[]))
    );
  }
  
  // CRUD Operations
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
  
  updateConsoleStatus(id: string, status: 'free' | 'occupied'): Promise<void> {
    const consoleDoc = doc(this.firestore, `consoles/${id}`);
    return updateDoc(consoleDoc, { status });
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
      .pipe(
        map(sessions => (sessions as Session[]).reduce((sum, s) => sum + (s.cost || 0), 0))
      );
  }
  
  // Example of a query
  getActiveConsoles(): Observable<Console[]> {
    const consolesCollection = collection(this.firestore, 'consoles');
    const activeConsolesQuery = query(consolesCollection, where('status', '==', 'occupied'));
    return collectionData(activeConsolesQuery, { idField: 'id' }) as Observable<Console[]>;
  }
  
  // Get a single document
  getConsole(id: string): Observable<Console> {
    const consoleDoc = doc(this.firestore, `consoles/${id}`);
    return docData(consoleDoc, { idField: 'id' }) as Observable<Console>;
  }
  
  // Cleanup subscriptions
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
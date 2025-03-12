import { Injectable, signal } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
// import { Console, Session, Order, Customer } from '../models';
import { map } from 'rxjs';
import { Session } from '../models/session.model';
import { Order } from '../models/order.model';
import { Customer } from '../models/customer.model';
import { Console } from '../models/console.model';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  consoles = signal<Console[]>([]);
  sessions = signal<Session[]>([]);
  orders = signal<Order[]>([]);
  customers = signal<Customer[]>([]);

  constructor(private firestore: AngularFirestore) {
    console.log(firestore)
    this.loadInitialData();
  }

  private loadInitialData() {
    this.firestore.collection<Console>('consoles').valueChanges({ idField: 'id' })
      .subscribe(data => this.consoles.set(data));
    this.firestore.collection<Session>('sessions').valueChanges({ idField: 'id' })
      .subscribe(data => this.sessions.set(data));
    this.firestore.collection<Order>('orders').valueChanges({ idField: 'id' })
      .subscribe(data => this.orders.set(data));
    this.firestore.collection<Customer>('customers').valueChanges({ idField: 'id' })
      .subscribe(data => this.customers.set(data));
  }

  createSession(session: Session) {
    return this.firestore.collection('sessions').add(session);
  }

  updateSession(id: string, session: Partial<Session>) {
    return this.firestore.collection('sessions').doc(id).update(session);
  }

  createOrder(order: Order) {
    return this.firestore.collection('orders').add(order);
  }

  updateConsoleStatus(id: string, status: 'free' | 'occupied') {
    return this.firestore.collection('consoles').doc(id).update({ status });
  }

  createCustomer(customer: Customer) {
    return this.firestore.collection('customers').doc(customer.id).set(customer);
  }

  updateCustomer(id: string, customer: Partial<Customer>) {
    return this.firestore.collection('customers').doc(id).update(customer);
  }

  getTotalRevenue() {
    return this.firestore.collection<Session>('sessions').valueChanges()
      .pipe(map(sessions => sessions.reduce((sum, s) => sum + (s.cost || 0), 0)));
  }
}
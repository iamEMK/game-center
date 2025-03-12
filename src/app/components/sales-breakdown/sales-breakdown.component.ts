import { Component, Input, signal, inject } from '@angular/core';
import { Session } from '../../models/session.model';
import { FirebaseService } from '../../services/firebase.service';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule],
  selector: 'app-sales-breakdown',
  templateUrl: './sales-breakdown.component.html'
})
export class SalesBreakdownComponent {
  @Input() sessions: Session[] = [];
  private firebaseService = inject(FirebaseService)
  consoleBreakdown = signal<Record<string, { totalCost: number, count: number }>>({});
  customerBreakdown = signal<Record<string, { totalCost: number, count: number }>>({});
  consoles = this.firebaseService.consoles;
  customers = this.firebaseService.customers;

  constructor() {}

  ngOnChanges() {
    this.calculateBreakdowns();
  }

  calculateBreakdowns() {
    const consoleBreakdown: Record<string, { totalCost: number, count: number }> = {};
    const customerBreakdown: Record<string, { totalCost: number, count: number }> = {};

    this.sessions.forEach(session => {
      // Console breakdown
      consoleBreakdown[session.consoleId] = consoleBreakdown[session.consoleId] || { totalCost: 0, count: 0 };
      consoleBreakdown[session.consoleId].totalCost += session.cost || 0;
      consoleBreakdown[session.consoleId].count += 1;

      // Customer breakdown
      session.customerIds.forEach(id => {
        customerBreakdown[id] = customerBreakdown[id] || { totalCost: 0, count: 1 };
        customerBreakdown[id].totalCost += (session.cost || 0) / session.customerIds.length; // Split cost evenly
        customerBreakdown[id].count += 1;
      });
    });

    this.consoleBreakdown.set(consoleBreakdown);
    this.customerBreakdown.set(customerBreakdown);
  }

  getConsoleName(id: string): string {
    return this.consoles().find(c => c.id === id)?.name || 'Unknown';
  }

  getCustomerName(id: string): string {
    return this.customers().find(c => c.id === id)?.name || 'Unknown';
  }
}
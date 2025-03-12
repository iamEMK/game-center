import { Component, signal, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import jsPDF from 'jspdf';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule],
  selector: 'app-invoice-display',
  templateUrl: './invoice-display.component.html'
})
export class InvoiceDisplayComponent {
    private route = inject(ActivatedRoute)
    private firebaseService = inject(FirebaseService)
  sessionId = this.route.snapshot.paramMap.get('sessionId')!;
  session = computed(() => this.firebaseService.sessions().find(s => s.id === this.sessionId));
  orders = computed(() => this.firebaseService.orders().filter(o => o.sessionId === this.sessionId));
  console = computed(() => this.firebaseService.consoles().find(c => c.id === this.session()?.consoleId));
  customers = computed(() => this.firebaseService.customers().filter(c => this.session()?.customerIds.includes(c.id)));

  constructor( ) {
    const session = this.session();
    if (session) {
      const totalCost = session.cost;
      this.customers().forEach(customer => {
        const pointsEarned = Math.floor(totalCost / 10); // 1 point per 10 INR
        const updatedPoints = (customer.loyaltyPoints || 0) + pointsEarned;
        const loyaltyDiscount = updatedPoints >= 50 ? 0.05 : 0; // 5% off after 50 points
        this.firebaseService.updateCustomer(customer.id, {
          totalSpent: (customer.totalSpent || 0) + totalCost,
          loyaltyPoints: updatedPoints,
          additionalDiscount: customer.additionalDiscount || loyaltyDiscount
        });
      });
    }
  }

  getTotalCost() {
    const sessionCost = this.session()?.cost || 0;
    const orderCost = this.orders().reduce((sum, order) => sum + order.cost, 0);
    const totalBeforeDiscount = sessionCost + orderCost;
    const discount = this.customers().reduce((sum, c) => sum + (c.additionalDiscount || 0), 0);
    return Math.round(totalBeforeDiscount * (1 - discount));
  }

  downloadPDF() {
    const doc = new jsPDF();
    doc.text(`Invoice for ${this.console()?.name}`, 10, 10);
    doc.text(`Players: ${this.session()?.playerQty}`, 10, 20);
    doc.text(`Duration: ${((this.session()!.endTime! - this.session()!.startTime) / 60000)} mins`, 10, 30);
    doc.text(`Session Cost: ${this.session()?.cost} INR`, 10, 40);
    this.orders().forEach((order, i) => doc.text(`${order.item}: ${order.cost} INR`, 10, 50 + i * 10));
    this.customers().forEach((customer, i) => {
      doc.text(`${customer.name}: ${customer.additionalDiscount * 100}% off`, 10, 60 + this.orders().length * 10 + i * 10);
    });
    doc.text(`Total: ${this.getTotalCost()} INR`, 10, 70 + this.orders().length * 10 + this.customers().length * 10);
    doc.save('invoice.pdf');
  }
}
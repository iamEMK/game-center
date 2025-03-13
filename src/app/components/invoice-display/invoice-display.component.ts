// import { Component, signal, computed, inject } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { FirebaseService } from '../../services/firebase.service';
// import jsPDF from 'jspdf';
// import { MaterialModule } from '../../material.module';
// import { CommonModule } from '@angular/common';

// @Component({
//   standalone: true,
//   imports: [CommonModule, MaterialModule],
//   selector: 'app-invoice-display',
//   templateUrl: './invoice-display.component.html'
// })
// export class InvoiceDisplayComponent {
//     private route = inject(ActivatedRoute)
//     private firebaseService = inject(FirebaseService)
//   sessionId = this.route.snapshot.paramMap.get('sessionId')!;
//   session = computed(() => this.firebaseService.sessions().find(s => s.id === this.sessionId));
//   orders = computed(() => this.firebaseService.orders().filter(o => o.sessionId === this.sessionId));
//   console = computed(() => this.firebaseService.consoles().find(c => c.id === this.session()?.consoleId));
//   customers = computed(() => this.firebaseService.customers().filter(c => this.session()?.customerIds.includes(c.id)));

//   constructor( ) {
//     const session = this.session();
//     if (session) {
//       const totalCost = session.cost;
//       this.customers().forEach(customer => {
//         const pointsEarned = Math.floor(totalCost / 10); // 1 point per 10 INR
//         const updatedPoints = (customer.loyaltyPoints || 0) + pointsEarned;
//         const loyaltyDiscount = updatedPoints >= 50 ? 0.05 : 0; // 5% off after 50 points
//         this.firebaseService.updateCustomer(customer.id, {
//           totalSpent: (customer.totalSpent || 0) + totalCost,
//           loyaltyPoints: updatedPoints,
//           additionalDiscount: customer.additionalDiscount || loyaltyDiscount
//         });
//       });
//     }
//   }

//   getTotalCost() {
//     const sessionCost = this.session()?.cost || 0;
//     const orderCost = this.orders().reduce((sum, order) => sum + order.cost, 0);
//     const totalBeforeDiscount = sessionCost + orderCost;
//     const discount = this.customers().reduce((sum, c) => sum + (c.additionalDiscount || 0), 0);
//     return Math.round(totalBeforeDiscount * (1 - discount));
//   }

//   downloadPDF() {
//     const doc = new jsPDF();
//     doc.text(`Invoice for ${this.console()?.name}`, 10, 10);
//     doc.text(`Players: ${this.session()?.playerQty}`, 10, 20);
//     doc.text(`Duration: ${((this.session()!.endTime! - this.session()!.startTime) / 60000)} mins`, 10, 30);
//     doc.text(`Session Cost: ${this.session()?.cost} INR`, 10, 40);
//     this.orders().forEach((order, i) => doc.text(`${order.item}: ${order.cost} INR`, 10, 50 + i * 10));
//     this.customers().forEach((customer, i) => {
//       doc.text(`${customer.name}: ${customer.additionalDiscount * 100}% off`, 10, 60 + this.orders().length * 10 + i * 10);
//     });
//     doc.text(`Total: ${this.getTotalCost()} INR`, 10, 70 + this.orders().length * 10 + this.customers().length * 10);
//     doc.save('invoice.pdf');
//   }
// }

import { Component, signal, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import jsPDF from 'jspdf';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { Invoice } from '../../models/invoice.model';
import { Session } from '../../models/session.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule],
  selector: 'app-invoice-display',
  templateUrl: './invoice-display.component.html'
})
export class InvoiceDisplayComponent {
  private route =  inject(ActivatedRoute)
  sessionId = this.route.snapshot.paramMap.get('sessionId')!;
  session = computed(() => this.firebaseService.sessions().find(s => s.id === this.sessionId));
  orders = computed(() => this.firebaseService.orders().filter(o => o.sessionId === this.sessionId));
  // invoice = signal<Invoice | null>(null);
  console = computed(() => this.firebaseService.consoles().find(c => c.id === this.session()?.consoleId));
  customers = computed(() => this.firebaseService.customers().filter(c => this.session()?.customerIds.includes(c.id)));
  invoice = computed(() => this.firebaseService.invoices().find(i => i.sessionId === this.sessionId) || null);
  constructor( private firebaseService: FirebaseService) {
    // this.firebaseService.sessions().forEach(s => {
    //   if (s.id === this.sessionId && s.status === 'completed') {
    //     const invoice = this.firebaseService.customers(); // Assuming invoices are stored in a signal or fetched separately
    //     this.invoice.set(this.getInvoiceForSession());
    //   }
    // });
  }
  // invoice = computed(() => this.firebaseService.invoices().find(i => i.sessionId === this.sessionId) || null);
  getInvoiceForSession(): Invoice | null {
    
    // Replace with actual invoice fetching logic if stored in Firestore separately
    return this.firebaseService.sessions().flatMap(s => s.id === this.sessionId ? [this.getMockInvoice(s)] : []).pop() || null;
  }

  getMockInvoice(session: Session): Invoice {
    // Mock for now; replace with real invoice data
    return {
      id: uuidv4(),
      sessionId: session.id!,
      customerIds: session.customerIds,
      totalAmount: session.cost,
      loyaltyPointsUsed: 0,
      discountApplied: this.customers().reduce((sum, c) => sum + (c.additionalDiscount || 0), 0),
      payableAmount: session.cost * (1 - this.customers().reduce((sum, c) => sum + (c.additionalDiscount || 0), 0)),
      paymentMethod: 'CASH',
      paymentStatus: 'COMPLETED',
      timestamp: Date.now()
    };
  }

  downloadPDF() {
    const doc = new jsPDF();
    const invoice = this.invoice();
    if (!invoice) return;

    doc.text(`Invoice #${invoice.id}`, 10, 10);
    doc.text(`Console: ${this.console()?.name}`, 10, 20);
    doc.text(`Customers: ${this.customers().map(c => c.name).join(', ')}`, 10, 30);
    doc.text(`Players: ${this.session()?.playerQty}`, 10, 40);
    doc.text(`Duration: ${((this.session()!.endTime! - this.session()!.startTime) / 60000)} mins`, 10, 50);
    doc.text(`Session Cost: ${invoice.totalAmount} INR`, 10, 60);
    this.orders().forEach((order, i) => doc.text(`${order.item}: ${order.cost} INR`, 10, 70 + i * 10));
    doc.text(`Discount: ${invoice.discountApplied * 100}%`, 10, 80 + this.orders().length * 10);
    doc.text(`Loyalty Points Used: ${invoice.loyaltyPointsUsed}`, 10, 90 + this.orders().length * 10);
    doc.text(`Payable Amount: ${invoice.payableAmount} INR`, 10, 100 + this.orders().length * 10);
    doc.text(`Payment Method: ${invoice.paymentMethod}`, 10, 110 + this.orders().length * 10);
    if (invoice.transactionId) doc.text(`Transaction ID: ${invoice.transactionId}`, 10, 120 + this.orders().length * 10);
    doc.save(`invoice-${invoice.id}.pdf`);
  }
}
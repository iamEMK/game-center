import { Component, Inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { Session } from '../../models/session.model';
import { Customer } from '../../models/customer.model';
import { Invoice } from '../../models/invoice.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  selector: 'app-payment',
  templateUrl: './payment.component.html'
})
export class PaymentComponent {
  paymentForm: FormGroup;
  session: Session;
  customers = signal<Customer[]>([]);
  totalAmount: number;
  payableAmount = signal(0);
  loyaltyPointsUsed = signal(0);
  discountApplied = signal(0);
  newLoyaltyPointsEarned = signal(0);

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private dialogRef: MatDialogRef<PaymentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Session
  ) {
    this.session = data;
    this.totalAmount = this.session.cost || 0;
    this.paymentForm = this.fb.group({
      paymentMethod: ['CASH', Validators.required],
      useLoyaltyPoints: [false],
      transactionId: ['']
    });

    this.loadCustomers();
    this.calculateNewLoyaltyPoints();
    this.updatePayableAmount();
  }

  loadCustomers() {
    this.customers.set(this.firebaseService.customers().filter(c => this.session.customerIds.includes(c.id)));
    this.discountApplied.set(this.customers().reduce((sum, c) => sum + (c.additionalDiscount || 0), 0));
  }

  getTotalLoyaltyPoints(): number {
    return this.customers().reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  }

  calculateNewLoyaltyPoints() {
    this.newLoyaltyPointsEarned.set(Math.floor(this.totalAmount / 10));
  }

  updatePayableAmount() {
    const baseAmount = this.totalAmount * (1 - this.discountApplied());
    const pointsValue = this.paymentForm.value.useLoyaltyPoints ? Math.min(this.loyaltyPointsUsed(), this.getTotalLoyaltyPoints()) : 0;
    this.payableAmount.set(Math.max(baseAmount - pointsValue, 0));
  }

  onLoyaltyPointsChange(event: Event) {
    const points = Number((event.target as HTMLInputElement).value);
    this.loyaltyPointsUsed.set(points > this.getTotalLoyaltyPoints() ? this.getTotalLoyaltyPoints() : points);
    this.updatePayableAmount();
  }

  onUseLoyaltyPointsChange() {
    this.updatePayableAmount();
  }

//   onPay() {
//     if (this.paymentForm.valid) {
//       const invoiceData: Partial<Invoice> = {
//         id: uuidv4(),
//         sessionId: this.session.id!,
//         customerIds: this.session.customerIds,
//         totalAmount: this.totalAmount,
//         loyaltyPointsUsed: this.paymentForm.value.useLoyaltyPoints ? this.loyaltyPointsUsed() : 0,
//         discountApplied: this.discountApplied(),
//         payableAmount: this.payableAmount(),
//         paymentMethod: this.paymentForm.value.paymentMethod,
//         paymentStatus: 'COMPLETED', // Mark as paid
//         timestamp: Date.now()
//       };

//       if (this.paymentForm.value.transactionId && this.paymentForm.value.transactionId.trim() !== '') {
//         invoiceData.transactionId = this.paymentForm.value.transactionId;
//       }

//       const invoice = invoiceData as Invoice;

//       // Update loyalty points and create invoice
//       const promises = this.customers().map(c => {
//         const pointsPerCustomer = this.newLoyaltyPointsEarned() / this.customers().length;
//         const usedPointsPerCustomer = this.paymentForm.value.useLoyaltyPoints ? this.loyaltyPointsUsed() / this.customers().length : 0;
//         const currentPoints = c.loyaltyPoints || 0;
//         const updatedPoints = Math.max(currentPoints + pointsPerCustomer - usedPointsPerCustomer, 0);

//         return this.firebaseService.updateLoyaltyPoints(c.id, updatedPoints);
//       });

//       Promise.all([
//           this.firebaseService.createInvoice(invoice),
//           this.firebaseService.updateSession(this.session.id!, { paymentStatus: 'PAID' }),
//         ...promises
//       ]).then(() => {
//         this.dialogRef.close(invoice); // Return invoice to indicate payment completed
//       }).catch(error => {
//         console.error('Error creating invoice or updating loyalty points:', error);
//       });
//     }
//   }

  onPay() {
    if (this.paymentForm.valid) {
      const invoiceData: Partial<Invoice> = {
        id: uuidv4(),
        sessionId: this.session.id!,
        customerIds: this.session.customerIds,
        totalAmount: this.totalAmount,
        loyaltyPointsUsed: this.paymentForm.value.useLoyaltyPoints ? this.loyaltyPointsUsed() : 0,
        discountApplied: this.discountApplied(),
        payableAmount: this.payableAmount(),
        paymentMethod: this.paymentForm.value.paymentMethod,
        paymentStatus: 'COMPLETED',
        timestamp: Date.now()
      };
  
      if (this.paymentForm.value.transactionId && this.paymentForm.value.transactionId.trim() !== '') {
        invoiceData.transactionId = this.paymentForm.value.transactionId;
      }
  
      const invoice = invoiceData as Invoice;
  
      const promises = this.customers().map(c => {
        const pointsPerCustomer = this.newLoyaltyPointsEarned() / this.customers().length;
        const usedPointsPerCustomer = this.paymentForm.value.useLoyaltyPoints ? this.loyaltyPointsUsed() / this.customers().length : 0;
        const currentPoints = c.loyaltyPoints || 0;
        const updatedPoints = Math.max(currentPoints + pointsPerCustomer - usedPointsPerCustomer, 0);
        return this.firebaseService.updateLoyaltyPoints(c.id, updatedPoints);
      });
  
      Promise.all([
        this.firebaseService.createInvoice(invoice),
        this.firebaseService.updateSession(this.session.id!, { paymentStatus: 'PAID' }), // Mark session as paid
        ...promises
      ]).then(() => {
        this.dialogRef.close(invoice);
      }).catch(error => {
        console.error('Error creating invoice or updating session:', error);
      });
    }
  }
  onClose() {
    // Close dialog without creating an invoice (payment pending)
    this.dialogRef.close(null);
  }
}
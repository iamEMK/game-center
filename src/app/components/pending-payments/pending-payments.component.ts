import { Component, signal, computed, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { Session } from '../../models/session.model';
import { PaymentComponent } from '../payment/payment.component';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule],
  selector: 'app-pending-payments',
  templateUrl: './pending-payments.component.html',
  styleUrls: ['./pending-payments.component.scss']
})
export class PendingPaymentsComponent {
    private firebaseService = inject(FirebaseService)

  pendingSessions = signal<Session[]>([]);
  consoles = this.firebaseService.consoles;
  customers = this.firebaseService.customers;

  constructor(
    private dialog: MatDialog,
    private router: Router
  ) {
    this.loadPendingSessions();
  }

  loadPendingSessions() {
    this.firebaseService.getPendingPayments().subscribe(sessions => {
      this.pendingSessions.set(sessions);
    });
  }

  paySession(session: Session) {
    const dialogRef = this.dialog.open(PaymentComponent, {
      width: '500px',
      data: session
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.paymentStatus === 'COMPLETED') {
        // Update session to mark as paid
        this.firebaseService.updateSession(session.id!, { paymentStatus: 'PAID' }).then(() => {
          this.loadPendingSessions(); // Refresh list
          this.router.navigate(['/invoice', session.id]); // Navigate to invoice
        });
      }
    });
  }

  getConsoleName(consoleId: string): string {
    return this.consoles().find(c => c.id === consoleId)?.name || 'Unknown';
  }

  getCustomerNames(customerIds: string[]): string {
    return customerIds.map(id => this.customers().find(c => c.id === id)?.name || 'Unknown').join(', ');
  }

  getDuration(session: Session): number {
    return session.endTime ? (session.endTime - session.startTime) / 60000 : 0;
  }
}
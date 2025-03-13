import { Component, computed, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PaymentComponent } from '../payment/payment.component';
import { Session } from '../../models/session.model';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule],
  selector: 'app-session-tracker',
  templateUrl: './session-tracker.component.html'
})
export class SessionTrackerComponent {
  private firebaseService =  inject(FirebaseService)
  activeSessions = computed(() => 
    this.firebaseService.sessions()
      .filter(s => s.status === 'active')
      .map(s => this.calculateCost(s))
  );
  consoles = this.firebaseService.consoles;

  constructor(
  
    private router: Router,
    private dialog: MatDialog
  ) {
    interval(1000).subscribe(() => this.activeSessions());
  }

  calculateCost(session: Session) {
    const now = Date.now();
    const duration = session.endTime ? (session.endTime - session.startTime) / 60000 : (now - session.startTime) / 60000;
    const rate = this.getZoneRate(this.getConsole(session.consoleId)?.zone);
    const runningCost = Math.round(duration * session.playerQty * rate);
    return { ...session, duration, runningCost };
  }

  getZoneRate(zone: string = 'standard') {
    return zone === 'VIP' ? 6 : 5;
  }

  getConsole(consoleId: string) {
    return this.consoles().find(c => c.id === consoleId);
  }

  stopSession(session: Session) {
    const updatedSession: Session = { 
      ...session, 
      endTime: Date.now(), 
      paymentStatus: 'PENDING',
      status: 'completed', // Mark as completed but payment pending
      cost: this.calculateCost(session).runningCost!
    };

    // Free the console immediately and update session
    Promise.all([
      this.firebaseService.updateSession(session.id!, updatedSession),
      this.firebaseService.updateConsoleStatus(session.consoleId, 'free')
    ]).then(() => {
      // Open payment dialog after freeing console
      this.openPaymentDialog(updatedSession);
    }).catch(error => {
      console.error('Error stopping session:', error);
    });
  }

  openPaymentDialog(session: Session) {
    const dialogRef = this.dialog.open(PaymentComponent, {
      width: '500px',
      data: session
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.paymentStatus === 'COMPLETED') {
        this.router.navigate(['/invoice', session.id]); // Navigate to invoice only if paid
      }
      // If closed without payment, no navigation (pending payment)
    });
  }

  addOrder(sessionId: any) {
    this.router.navigate(['/order', sessionId]);
  }
}
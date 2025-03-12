import { Component, signal, effect, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { Session } from '../../models/session.model';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule],
  selector: 'app-session-tracker',
  templateUrl: './session-tracker.component.html'
})
export class SessionTrackerComponent {
  private firebaseService = inject(FirebaseService)

  activeSessions = signal<(Session & { duration?: number; runningCost?: number })[]>([]);
  consoles = this.firebaseService.consoles;

  constructor(private router: Router) {
    effect(() => {
      const sessions = this.firebaseService.sessions();
      this.activeSessions.set(sessions.filter(s => s.status === 'active').map(s => this.calculateCost(s)));
    });

    interval(1000).subscribe(() => {
      this.activeSessions.update(sessions => sessions.map(s => this.calculateCost(s)));
    });
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
    const updatedSession:Session = { ...session, endTime: Date.now(), status: 'completed', cost: this.calculateCost(session).runningCost! };
    this.firebaseService.updateSession(session.id!, updatedSession).then(() => {
      this.firebaseService.updateConsoleStatus(session.consoleId, 'free');
      this.router.navigate(['/invoice', session.id]);
    });
  }

  addOrder(sessionId: any) {
    this.router.navigate(['/order', sessionId]);
  }
}
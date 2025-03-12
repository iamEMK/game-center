import { Component, computed, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule],
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html'
})
export class AnalyticsDashboardComponent {
    private firebaseService = inject(FirebaseService)
  totalRevenue = this.firebaseService.getTotalRevenue();
  popularConsole = computed(() => {
    const sessions = this.firebaseService.sessions();
    const consoleCounts = sessions.reduce((acc, s) => {
      acc[s.consoleId] = (acc[s.consoleId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topId = Object.keys(consoleCounts).reduce((a, b) => consoleCounts[a] > consoleCounts[b] ? a : b);
    return this.firebaseService.consoles().find(c => c.id === topId)?.name;
  });

}
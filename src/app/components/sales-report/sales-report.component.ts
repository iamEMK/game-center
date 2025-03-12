import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { Session } from '../../models/session.model';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import jsPDF from 'jspdf';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule,NgxChartsModule],
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html'
})
export class SalesReportComponent {
  dateForm: FormGroup;
  reportData = signal<{ sessions: Session[], totalEarnings: number } | null>(null);
  private firebaseService = inject(FirebaseService)
  consoles = this.firebaseService.consoles;
  customers = this.firebaseService.customers;
  chartData = signal<{ name: string, value: number }[]>([]);
  constructor(
    private fb: FormBuilder,
  ) {
    this.dateForm = this.fb.group({
      fromDate: [new Date().toISOString().split('T')[0]],
      toDate: [new Date().toISOString().split('T')[0]]
    });
  }

  onSubmit() {
    const fromDate = new Date(this.dateForm.value.fromDate).getTime();
    const toDate = new Date(this.dateForm.value.toDate).getTime() + 86399999; // End of day
    this.firebaseService.getSalesReport(fromDate, toDate).subscribe(data => {
      this.reportData.set(data);
      this.updateChartData(data.sessions)
    });
  }
  updateChartData(sessions: Session[]) {
    const earningsByDate = sessions.reduce((acc, session) => {
      const date = new Date(session.startTime).toLocaleDateString();
      acc[date] = (acc[date] || 0) + (session.cost || 0);
      return acc;
    }, {} as Record<string, number>);
    this.chartData.set(Object.entries(earningsByDate).map(([name, value]) => ({ name, value })));
  }
  exportToPDF() {
    const doc = new jsPDF();
    const data = this.reportData();
    if (!data) return;

    doc.text('Sales Report', 10, 10);
    doc.text(`From: ${this.dateForm.value.fromDate} To: ${this.dateForm.value.toDate}`, 10, 20);
    doc.text(`Total Earnings: ${data.totalEarnings} INR`, 10, 30);
    data.sessions.forEach((s, i) => {
      doc.text(`${i + 1}. ${this.getConsoleName(s.consoleId)} - ${s.cost} INR (${this.getCustomerNames(s.customerIds)})`, 10, 40 + i * 10);
    });
    doc.save('sales-report.pdf');
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
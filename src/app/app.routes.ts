import { Routes } from '@angular/router';
import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { SessionTrackerComponent } from './components/session-tracker/session-tracker.component';
import { InvoiceDisplayComponent } from './components/invoice-display/invoice-display.component';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { AnalyticsDashboardComponent } from './components/analytics-dashboard/analytics-dashboard.component';
import { CustomerProfileComponent } from './components/customer-profile/customer-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/booking', pathMatch: 'full' },
  { path: 'booking', component: BookingFormComponent },
  { path: 'tracker', component: SessionTrackerComponent },
  { path: 'invoice/:sessionId', component: InvoiceDisplayComponent },
  { path: 'order/:sessionId', component: OrderFormComponent },
  { path: 'analytics', component: AnalyticsDashboardComponent },
  { path: 'profile/:customerId', component: CustomerProfileComponent }
];
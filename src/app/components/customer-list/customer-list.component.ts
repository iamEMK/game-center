import { Component, signal, computed } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { Customer } from '../../models/customer.model';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
// import { CustomerAddDialogComponent } from '../customer-add-dialog/customer-add-dialog.component';
import { FormsModule } from '@angular/forms';
import { CustomerAddDialogComponent } from '../customer-add-dialog/customer-add-dialog.component';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent {
  customers = signal<Customer[]>([]);
  filteredCustomers = computed(() => this.sortCustomers(this.customers()));
  pageSize = 5;
  currentPage = signal(0);
  lastDoc: any = null;
  filterValue = signal('');
  sortField = signal<'name' | 'totalSpent' | 'subscription'>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');
  displayedColumns = ['name', 'subscription', 'totalSpent', 'loyaltyPoints', 'discount'];
  constructor(
    private firebaseService: FirebaseService,
    private dialog: MatDialog
  ) {
    this.loadCustomers();
  }

  loadCustomers() {
    this.firebaseService.getPaginatedCustomers(this.pageSize, this.lastDoc).subscribe(({ customers, lastDoc }) => {
      this.customers.set(customers);
      this.lastDoc = lastDoc;
    });
  }

  nextPage() {
    if (this.lastDoc) {
      this.currentPage.update(page => page + 1);
      this.loadCustomers();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(page => page - 1);
      this.firebaseService.getPaginatedCustomers(this.pageSize, this.currentPage() === 0 ? null : this.lastDoc).subscribe(({ customers, lastDoc }) => {
        this.customers.set(customers);
        this.lastDoc = lastDoc;
      });
    }
  }

  applyFilter(event: Event) {
    const filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterValue.set(filter);
    if (filter) {
      this.firebaseService.getFilteredCustomers(filter).subscribe(customers => {
        this.customers.set(customers);
        this.currentPage.set(0); // Reset pagination on filter
        this.lastDoc = null;
      });
    } else {
      this.loadCustomers();
    }
  }

  sortCustomers(customers: Customer[]): Customer[] {
    const field = this.sortField();
    const direction = this.sortDirection();
    return customers.sort((a, b) => {
      const aValue = a[field] ?? '';
      const bValue = b[field] ?? '';
      return direction === 'asc'
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });
  }

  toggleSort(field: 'name' | 'totalSpent' | 'subscription') {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  openAddCustomerDialog() {
    const dialogRef = this.dialog.open(CustomerAddDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCustomers(); // Refresh list after adding
      }
    });
  }
}
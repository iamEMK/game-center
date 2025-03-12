import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { Customer } from '../../models/customer.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  selector: 'app-customer-add-dialog',
  templateUrl: './customer-add-dialog.component.html'
})
export class CustomerAddDialogComponent {
  customerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private dialogRef: MatDialogRef<CustomerAddDialogComponent>
  ) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      subscription: ['none', Validators.required]
    });
  }

  onSubmit() {
    if (this.customerForm.valid) {
      const customer: Customer = {
        id: uuidv4(),
        name: this.customerForm.value.name,
        subscription: this.customerForm.value.subscription,
        totalSpent: 0,
        loyaltyPoints: 0,
        additionalDiscount: this.customerForm.value.subscription === 'premium' ? 0.1 : 0
      };
      this.firebaseService.createCustomer(customer).then(() => {
        this.dialogRef.close(customer);
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
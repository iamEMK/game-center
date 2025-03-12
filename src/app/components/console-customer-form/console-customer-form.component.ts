import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { Console } from '../../models/console.model';
import { Customer } from '../../models/customer.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  selector: 'app-console-customer-form',
  templateUrl: './console-customer-form.component.html'
})
export class ConsoleCustomerFormComponent {
  consoleForm: FormGroup;
  customerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    // Console Form
    this.consoleForm = this.fb.group({
      name: ['', Validators.required],
      zone: ['standard', Validators.required]
    });

    // Customer Form
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      subscription: ['none', Validators.required]
    });
  }

  async onConsoleSubmit() {
    if (this.consoleForm.valid) {
      const consoleData: Console = {
        id: uuidv4(), // Optional: Firestore will generate an ID if omitted
        name: this.consoleForm.value.name,
        status: 'free',
        zone: this.consoleForm.value.zone
      };
      await this.firebaseService.createConsole(consoleData);
      this.consoleForm.reset({ zone: 'standard' });
      alert('Console created successfully!');
    }
  }

  async onCustomerSubmit() {
    if (this.customerForm.valid) {
      const customer: Customer = {
        id: uuidv4(),
        name: this.customerForm.value.name,
        subscription: this.customerForm.value.subscription,
        totalSpent: 0,
        loyaltyPoints: 0,
        additionalDiscount: this.customerForm.value.subscription === 'premium' ? 0.1 : 0
      };
      await this.firebaseService.createCustomer(customer);
      this.customerForm.reset({ subscription: 'none' });
      alert('Customer created successfully!');
    }
  }
}
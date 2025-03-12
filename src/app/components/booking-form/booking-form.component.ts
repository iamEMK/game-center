import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from '../../models/customer.model';
import { Session } from '../../models/session.model';
@Component({
    
  imports: [CommonModule, MaterialModule, ReactiveFormsModule ],
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html'
})
export class BookingFormComponent {
  // private firebaseService = inject(FirebaseService)

  constructor(
    private firebaseService : FirebaseService, 
    private fb: FormBuilder,
    private router: Router
  ) {
    this.bookingForm = this.fb.group({
      consoleId: ['', Validators.required],
      playerQty: [1, [Validators.min(1), Validators.max(4)]],
      startTime: [new Date().toISOString(), Validators.required],
      customerName: [''],
      subscription: ['none']
    });
  this.availableConsoles = this.firebaseService.consoles;
  this.customers  = this.firebaseService.customers;


  }
  bookingForm: FormGroup;
  availableConsoles : any = '' 
  customers : any = '' 

  async onSubmit() {
    if (this.bookingForm.valid) {
      let customerId = 'default-' + uuidv4();
      if (this.bookingForm.value.customerName) {
        const newCustomer: Customer = {
          id: uuidv4(),
          name: this.bookingForm.value.customerName,
          subscription: this.bookingForm.value.subscription,
          totalSpent: 0,
          loyaltyPoints: 0,
          additionalDiscount: this.bookingForm.value.subscription === 'premium' ? 0.1 : 0
        };
        await this.firebaseService.createCustomer(newCustomer);
        customerId = newCustomer.id;
      }

      const session : Session = {
        consoleId: this.bookingForm.value.consoleId,
        startTime: new Date(this.bookingForm.value.startTime).getTime(),
        cost: 0,
        status: 'active',
        customerIds: [customerId],
        playerQty: this.bookingForm.value.playerQty
      };
      this.firebaseService.createSession(session).then(() => {
        this.firebaseService.updateConsoleStatus(session.consoleId, 'occupied');
        this.router.navigate(['/tracker']);
      });
    }
  }
}
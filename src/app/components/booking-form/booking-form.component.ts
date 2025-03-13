import { Component, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from '../../models/customer.model';
import { Session } from '../../models/session.model';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html'
})
export class BookingFormComponent {
  bookingForm: FormGroup;
  availableConsoles = computed(() => this.firebaseService.consoles().filter(c => c.status === 'free')); // Computed signal
  customers = computed(() => this.firebaseService.customers()); // Computed signal

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.bookingForm = this.fb.group({
      consoleId: ['', Validators.required],
      playerQty: [1, [Validators.min(1), Validators.max(4)]],
      startTime: [new Date(), Validators.required],
      customerName: [''],
      subscription: ['none']
    });
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    const d = this.firebaseService.consoles()
    console.log(d);
  }
  displayFn(customer: Customer): string {
    return customer && customer.name;
  }
  async onSubmit() {
    if (this.bookingForm.valid) {
      let customerId = 'default-' + uuidv4();
      // if (this.bookingForm.value.customerName) {
      //   const newCustomer: Customer = {
      //     id: uuidv4(),
      //     name: this.bookingForm.value.customerName,
      //     subscription: this.bookingForm.value.subscription,
      //     totalSpent: 0,
      //     loyaltyPoints: 0,
      //     additionalDiscount: this.bookingForm.value.subscription === 'premium' ? 0.1 : 0
      //   };
      //   await this.firebaseService.createCustomer(newCustomer);
      //   customerId = newCustomer.id;
      // }

      const session : Session = {
        consoleId: this.bookingForm.value.consoleId,
        startTime: new Date(this.bookingForm.value.startTime).getTime(),
        cost: 0,
        status: 'active',
        customerIds: [this.bookingForm.value.customerName.id || customerId],
        playerQty: this.bookingForm.value.playerQty
      };
      this.firebaseService.createSession(session).then(() => {
        this.firebaseService.updateConsoleStatus(session.consoleId, 'occupied');
        this.router.navigate(['/tracker']);
      });
    }
  }
}
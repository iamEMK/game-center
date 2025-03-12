import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { Order } from '../../models/order.model';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  selector: 'app-order-form',
  templateUrl: './order-form.component.html'
})
export class OrderFormComponent {
  private route =  inject(ActivatedRoute)
  
  orderForm: FormGroup;
  sessionId = this.route.snapshot.paramMap.get('sessionId')!;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      item: ['', Validators.required],
      cost: [0, [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit() {
    if (this.orderForm.valid) {
      const order: Order = {
        sessionId: this.sessionId,
        item: this.orderForm.value.item,
        cost: this.orderForm.value.cost,
        status: 'pending'
      };
      this.firebaseService.createOrder(order).then(() => this.router.navigate(['/tracker']));
    }
  }
}
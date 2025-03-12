import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule],
  selector: 'app-customer-profile',
  templateUrl: './customer-profile.component.html'
})
export class CustomerProfileComponent {
    private route = inject(ActivatedRoute) ;
    constructor(private firebaseService: FirebaseService) {}

  customerId = this.route.snapshot.paramMap.get('customerId')!;
  customer = computed(() => this.firebaseService.customers().find(c => c.id === this.customerId));
  sessions = computed(() => this.firebaseService.sessions().filter(s => s.customerIds.includes(this.customerId)));

}
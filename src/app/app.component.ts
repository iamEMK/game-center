// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.scss'
// })
// export class AppComponent {
//   title = 'game-center';
// }

import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MaterialModule } from './material.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterLink, MaterialModule,

  ],
  selector: 'app-root',
  template: `
    <mat-toolbar>
      <button mat-button routerLink="/booking">Book</button>
      <button mat-button routerLink="/tracker">Track</button>
      <button mat-button routerLink="/analytics">Analytics</button>
      <button mat-button routerLink="/profile/default-uuid">Profile</button>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}
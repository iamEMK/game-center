import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import {
  getAnalytics,
  provideAnalytics,
  ScreenTrackingService,
  UserTrackingService,
} from '@angular/fire/analytics';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  provideAppCheck,
} from '@angular/fire/app-check';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import {
  getRemoteConfig,
  provideRemoteConfig,
} from '@angular/fire/remote-config';
import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai';
import { ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from './services/firebase.service';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Initialize Firebase app with your config
    provideFirebaseApp(() => initializeApp({
      projectId: 'emk-game-center',
      appId: '1:625514947066:web:f4856ca4ce58f89abe8443',
      storageBucket: 'emk-game-center.firebasestorage.app',
      apiKey: 'AIzaSyB8q3FxuugoQk1Mk0OQ8xe34-NM_2O_Tfs',
      authDomain: 'emk-game-center.firebaseapp.com',
      messagingSenderId: '625514947066',
    })),
    // Provide Firestore instance
    provideFirestore(() => getFirestore()),
    // Include ReactiveFormsModule for form handling
    importProvidersFrom(ReactiveFormsModule),

    // provideZoneChangeDetection({ eventCoalescing: true }),
    // provideRouter(routes),
    // provideFirebaseApp(() =>
    //   initializeApp({
    //     projectId: 'emk-game-center',
    //     appId: '1:625514947066:web:f4856ca4ce58f89abe8443',
    //     storageBucket: 'emk-game-center.firebasestorage.app',
    //     apiKey: 'AIzaSyB8q3FxuugoQk1Mk0OQ8xe34-NM_2O_Tfs',
    //     authDomain: 'emk-game-center.firebaseapp.com',
    //     messagingSenderId: '625514947066',
    //   })
    // ),
    // provideAuth(() => getAuth()),
    // provideAnalytics(() => getAnalytics()),
    // ScreenTrackingService,
    // UserTrackingService,
    // FirebaseService,
    // //  provideAppCheck(() => {
    // // TODO get a reCAPTCHA Enterprise here https://console.cloud.google.com/security/recaptcha?project=_
    // // const provider = new ReCaptchaEnterpriseProvider(/* reCAPTCHA Enterprise site key */);
    // // return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
    // // })
    // // ,
    // // AngularFirestoreModule,
    // provideFirestore(() => getFirestore()),
    // // provideDatabase(() => getDatabase()),
    // // provideFunctions(() => getFunctions()),
    // // provideMessaging(() => getMessaging()),
    // // providePerformance(() => getPerformance()),
    // // provideStorage(() => getStorage()),
    // // provideRemoteConfig(() => getRemoteConfig()),
    // // provideVertexAI(() => getVertexAI()),
    // importProvidersFrom(ReactiveFormsModule),
  ],
};

import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import {MatTimepickerModule} from '@angular/material/timepicker'
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import {MatCheckboxModule} from '@angular/material/checkbox';

@NgModule({
  exports: [
    MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule,MatAutocompleteModule,MatOptionModule, MatCheckboxModule,
    MatSelectModule, MatToolbarModule, MatGridListModule, MatListModule , MatTimepickerModule, MatDialogModule,MatTableModule
  ]
})
export class MaterialModule {}
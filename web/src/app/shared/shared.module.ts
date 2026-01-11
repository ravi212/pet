import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ButtonComponent,
  CardComponent,
  InputComponent,
  BadgeComponent,
  AlertComponent,
  ModalComponent,
  SkeletonComponent,
  DataTableComponent,
  SideSheetComponent,
  PaginationComponent,
  SelectComponent,
  TextareaComponent,
  AppCheckboxComponent,
  AppHeaderComponent,
  AppSidebarComponent,
  AppRadioGroupComponent,
  AppDatePickerComponent,
  ConfirmDialogComponent,
  ColorPickerComponent,
  FileUploadComponent
} from './components';
import { NoDataComponent } from './pages/no-data/no-data.component';


const SHARED_COMPONENTS = [
  ButtonComponent,
  CardComponent,
  InputComponent,
  BadgeComponent,
  AlertComponent,
  ModalComponent,
  SkeletonComponent,
  DataTableComponent,
  SideSheetComponent,
  PaginationComponent,
  SelectComponent,
  TextareaComponent,
  AppCheckboxComponent,
  AppHeaderComponent,
  AppSidebarComponent,
  AppRadioGroupComponent,
  AppDatePickerComponent,
  ConfirmDialogComponent,
  ColorPickerComponent,
  FileUploadComponent,
  NoDataComponent
];

@NgModule({
  declarations: [],
  imports: [CommonModule, ...SHARED_COMPONENTS],
  exports: [...SHARED_COMPONENTS],
})
export class SharedModule {}

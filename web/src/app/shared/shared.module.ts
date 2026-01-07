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
} from './components';
import { SideSheetComponent } from './components/side-sheet/sheet.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { SelectComponent } from './components/select/select.component';
import { TextareaComponent } from './components/text-area/text-area.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { AppHeaderComponent } from './components/layout/header.component';
import { AppSidebarComponent } from './components/layout/sidebar.component';

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
  ConfirmDialogComponent,
  AppHeaderComponent,
  AppSidebarComponent
];

@NgModule({
  declarations: [],
  imports: [CommonModule, ...SHARED_COMPONENTS],
  exports: [...SHARED_COMPONENTS],
})
export class SharedModule {}

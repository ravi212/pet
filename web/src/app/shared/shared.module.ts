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
} from './components';

const SHARED_COMPONENTS = [
  ButtonComponent,
  CardComponent,
  InputComponent,
  BadgeComponent,
  AlertComponent,
  ModalComponent,
  SkeletonComponent,
];

@NgModule({
  declarations: [],
  imports: [CommonModule, ...SHARED_COMPONENTS],
  exports: [...SHARED_COMPONENTS],
})
export class SharedModule {}

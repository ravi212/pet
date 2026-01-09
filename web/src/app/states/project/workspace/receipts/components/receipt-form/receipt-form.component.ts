import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../../../shared/shared.module';
import { ReceiptsService } from '../../services/receipts.service';
@Component({
  selector: 'app-receipt-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  templateUrl: './receipt-form.component.html',
})
export class ReceiptFormComponent implements OnInit {
  @Input() projectId!: string;
  @Input() receipt?: any; // edit mode
  @Output() saved = new EventEmitter<void>();
  receiptsService = inject(ReceiptsService);

  form!: FormGroup;

  ngOnInit() {
    this.form = new FormBuilder().group({
      file: [null, Validators.required],
      description: [this.receipt?.description || ''],
      expenseId: [this.receipt?.expenseId || ''],
    });
  }

  submit() {
    if (!this.receipt && !this.form.value.file) {
      this.form.get('file')?.markAsTouched();
      return;
    }

    if (this.receipt) {
      // EDIT
      this.updateReceipt();
    } else {
      // CREATE
      this.createReceipt();
    }
  }

  private createReceipt() {
    const { file, description, expenseId } = this.form.value;

    this.receiptsService.upload(file, {
      projectId: this.projectId,
      description,
      expenseId,
    }).subscribe(() => this.saved.emit());
  }

  private updateReceipt() {
    this.receiptsService.update(this.receipt.id, {
      description: this.form.value.description,
    }).subscribe(() => this.saved.emit());
  }
}



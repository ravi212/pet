import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../../../shared/shared.module';
import { Receipt, ReceiptsService } from '../../services/receipts.service';
import { SafeUrlPipe } from '../../../../../../shared/pipes/safeurl.pipe';
import { baseUrl } from '../../../../../../shared/constants/endpoints.const';
import { FileText, LucideAngularModule } from 'lucide-angular';
import { DropdownLoader } from '../../../../../../shared/helpers/dropdown-loader';
import { ExpensesService } from '../../../expenses/services/expense.service';
@Component({
  selector: 'app-receipt-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, SafeUrlPipe, LucideAngularModule],
  templateUrl: './receipt-form.component.html',
})
export class ReceiptFormComponent implements OnInit {
  @Input() projectId!: string;
  @Input() receipt?: Receipt | null;
  @Output() saved = new EventEmitter<void>();
  @Output() showPreview = new EventEmitter<boolean>(false);

  receiptsService = inject(ReceiptsService);
  expensesService = inject(ExpensesService);

  isPreviewOpen = false;
  previewUrl: string | null = null;
  previewName: string | null = null;
  baseUrl = baseUrl;
  readonly fileIcon = FileText;
  form!: FormGroup;

  expensesDropdown!: DropdownLoader<{ label: string; value: string }>;

  ngOnInit() {
    this.form = new FormBuilder().group({
      file: [null, Validators.required],
      description: [this.receipt?.description || ''],
      expenseId: [this.receipt?.expenseId ?? null],
    });
    this.expensesDropdown = new DropdownLoader(this.projectId, (params) =>
      this.expensesService.getDropdown(params)
    );

    this.expensesDropdown.load();
  }

  submit() {
    if (!this.receipt && !this.form.value.file) {
      this.form.get('file')?.markAsTouched();
      return;
    }

    if (this.receipt) {
      // EDIT
      this.previewUrl = this.getUploadedFileUrl();
      this.previewName = this.receipt.originalFileName;
      this.updateReceipt();
    } else {
      // CREATE
      this.createReceipt();
    }
  }

  private createReceipt() {
    const { file, description, expenseId } = this.form.value;

    this.receiptsService
      .upload(file, {
        projectId: this.projectId,
        description,
        expenseId,
      })
      .subscribe(() => this.saved.emit());
  }

  private updateReceipt() {
    if (!this.receipt) return;
    this.receiptsService
      .update(this.receipt.id, {
        description: this.form.value.description,
        expenseId: this.form.value.expenseId,
      })
      .subscribe(() => this.saved.emit());
  }

  isImage(url: string | null) {
    if (!url) return false;
    console.log(url);
    return url.match(/\.(jpeg|jpg|png|gif)$/i);
  }

  getUploadedFileUrl() {
    const fileUrl = this.receipt?.fileUrl;
    if (!fileUrl) return null;
    return `${baseUrl}${fileUrl}`;
  }
}

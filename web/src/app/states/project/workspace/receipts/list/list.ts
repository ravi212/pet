import { Component, effect, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Trash2, Plus, FileText } from 'lucide-angular';
import { finalize } from 'rxjs';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReceiptFormComponent } from '../components/receipt-form/receipt-form.component';
import { Receipt, ReceiptsService } from '../services/receipts.service';
import { ProjectContextService } from '../../../services/project-context.service';
import { DataTableColumn } from '../../../../../shared/components';
import { baseUrl } from '../../../../../shared/constants/endpoints.const';
import { SafeUrlPipe } from '../../../../../shared/pipes/safeurl.pipe';
@Component({
  selector: 'app-receipts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, LucideAngularModule, ReceiptFormComponent, SafeUrlPipe],
  templateUrl: './list.html',
})
export class List implements OnInit {
  private receiptsService = inject(ReceiptsService);
  private context = inject(ProjectContextService);
  previewOpen = false;
  previewFileUrl: string | null = null;
  previewFileName: string | null = null;

  projectId!: string;

  receipts: Receipt[] = [];
  selectedReceipt: Receipt | null = null;

  loading = false;
  page = 1;
  limit = 10;
  total = 0;

  ocrStatus?: 'pending' | 'done' | 'failed';

  sideSheetOpen = false;
  confirmOpen = false;

  readonly deleteIcon = Trash2;
  readonly plusIcon = Plus;
  readonly fileIcon = FileText;

  @ViewChild('statusTpl', { static: true })
  statusTpl!: TemplateRef<{ $implicit: Receipt }>;

  @ViewChild('fileTpl', { static: true })
  fileTpl!: TemplateRef<{ $implicit: Receipt }>;

  @ViewChild('uploadedAtTpl', { static: true })
  uploadedAtTpl!: TemplateRef<{ $implicit: Receipt }>;

  @ViewChild(ReceiptFormComponent)
  receiptForm!: ReceiptFormComponent;

  columns: DataTableColumn<Receipt>[] = [];

  ngOnInit() {
    this.columns = [
      { key: 'originalFileName', label: 'File', template: this.fileTpl },
      { key: 'ocrStatus', label: 'OCR Status', template: this.statusTpl },
      { key: 'uploadedAt', label: 'Uploaded On', sortable: true, template: this.uploadedAtTpl },
    ];
  }

  constructor() {
    effect(() => {
      const projectId = this.context.projectId();
      if (!projectId) return;

      this.projectId = projectId;
      this.page = 1;
      this.loadReceipts();
    });
  }

  loadReceipts() {
    this.loading = true;

    this.receiptsService
      .findAll({
        projectId: this.projectId,
        page: this.page,
        limit: this.limit,
        ocrStatus: this.ocrStatus,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.receipts = res.data;
          this.total = res.total;
        },
        error: (err) => console.error('Failed to load receipts', err),
      });
  }

  openCreateSheet() {
    this.selectedReceipt = null;
    this.sideSheetOpen = true;
  }

  openConfirm(receipt: Receipt) {
    this.selectedReceipt = receipt;
    this.confirmOpen = true;
  }

  remove(receipt: Receipt | null) {
    if (!receipt) return;

    this.receiptsService.remove(receipt.id).subscribe({
      next: () => this.loadReceipts(),
      error: () => this.loadReceipts(),
    });
  }

  onSave() {
    this.sideSheetOpen = false;
    this.loadReceipts();
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadReceipts();
  }

  onLimitChange(limit: number) {
    this.limit = limit;
    this.page = 1;
    this.loadReceipts();
  }

  getUploadedFileUrl(fileUrl: string) {
    return `${baseUrl}${fileUrl}`;
  }

  openFilePreview(fileUrl: string, fileName: string) {
    this.previewFileUrl = this.getUploadedFileUrl(fileUrl);
    this.previewFileName = fileName;
    this.previewOpen = true;
  }

  isImage(url: string | null) {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|png|gif)$/i);
  }
}

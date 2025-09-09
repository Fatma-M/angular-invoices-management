import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Invoice } from '../../interfaces/invoice';
import { StoreService } from '../../services/store';
import { NgClass } from '@angular/common';
import { InvoiceStatus } from '../../enums/invoice-status';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  templateUrl: './invoice-view.html',
  styleUrl: './invoice-view.scss',
  imports: [RouterModule, NgClass],
})
export class InvoiceView implements OnInit, OnDestroy {
  private _destroy$ = new Subject();
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _storeService = inject(StoreService);
  invoiceStatus = InvoiceStatus;
  invoiceData = signal<Invoice | null>(null);

  ngOnInit(): void {
    this.getInvoiceData();
  }

  /**
   * @description method for get invoice by id from shared store service
   * @returns {void} void
   */
  getInvoiceData(): void {
    const invoiceId: string = this._activatedRoute.snapshot.paramMap.get('invoiceId') || '';
    this.invoiceData.set(this._storeService.getInvoiceData(invoiceId));

    if (!this.invoiceData()) {
      this._router.navigate(['/']);
    }
  }

  /**
   * @description method for handle edit invoice
   * @returns void
   */
  onEditInvoice(): void {
    this._router.navigate(['/invoice/edit', this.invoiceData()!.invoiceId]);
  }

  /**
   * @description method for handle delete invoice
   * @returns void
   */
  onDeleteInvoice(): void {
    this._storeService
      .deleteInvoice(this.invoiceData()!.docId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this._router.navigate(['/']);
        },
        error: (error: Error) => {
          console.log(error.message);
        },
      });
  }

  /**
   * @description method for handle change invoice status
   * @returns void
   */
  onChangeInvoiceStatus(selectedStatus: InvoiceStatus): void {
    this._storeService
      .changeInvoiceStatus(this.invoiceData()!.docId, selectedStatus)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this.invoiceData.update((invoice) => {
            if (!invoice) return invoice;

            return {
              ...invoice,
              invoicePending: selectedStatus === InvoiceStatus.Pending,
              invoicePaid: selectedStatus === InvoiceStatus.Paid,
              invoiceDraft: false,
            };
          });
        },
        error: (error: Error) => {
          console.error(error.message);
        },
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }
}

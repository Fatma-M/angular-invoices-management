import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Invoice } from '../../interfaces/invoice';
import { StoreService } from '../../services/store';
import { Subject, takeUntil } from 'rxjs';
import { FilterMenuItems } from '../../enums/filter';
import { InvoiceItem } from '../../components/invoice-item/invoice-item';
import { ClickOutsideDirective } from '../../directives/click-outside';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.scss',
  imports: [InvoiceItem, ClickOutsideDirective, MatProgressSpinnerModule],
})
export class InvoiceList implements OnInit, OnDestroy {
  private _destroy$ = new Subject();
  filterMenuItems = FilterMenuItems;
  invoices = signal<Invoice[]>([]);
  filteredInvoices = signal<Invoice[]>([]);
  filterMenuOpened = signal<boolean>(false);
  filteredInvoice = signal('');
  loading = signal(true);

  constructor(private _storeService: StoreService, private _route: Router) {}

  ngOnInit(): void {
    this.getInvoices();
  }

  /**
   * @description method for get all invoices from shared store service
   * @returns {void} void
   */
  getInvoices(): void {
    this._storeService
      .getInvoices()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: Invoice[]) => {
          this.invoices.set(res);
          this.filteredInvoices.set(res);
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  /**
   * @description method for toggle filter menu
   * @returns {void} void
   */
  toggleFilterMenu(): void {
    this.filterMenuOpened.set(!this.filterMenuOpened());
  }

  /**
   * @description method to filter data
   * @param {FilterMenuItems} filter - selected filter type
   * @returns {void}
   */
  filterData(filter: FilterMenuItems): void {
    switch (filter) {
      case FilterMenuItems.Draft:
        this.filteredInvoices.set(this.invoices().filter((i: Invoice) => i.invoiceDraft));
        break;

      case FilterMenuItems.Pending:
        this.filteredInvoices.set(this.invoices().filter((i: Invoice) => i.invoicePending));
        break;

      case FilterMenuItems.Paid:
        this.filteredInvoices.set(this.invoices().filter((i: Invoice) => i.invoicePaid));
        break;

      case FilterMenuItems.Clear:
      default:
        this.filteredInvoices.set([...this.invoices()]);
        break;
    }

    this.filteredInvoice.set(filter);
  }

  /**
   * @description method for create new invoice
   * @returns {void} void
   */
  newInvoice(): void {
    this._route.navigate(['/invoice/new']);
  }

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }
}

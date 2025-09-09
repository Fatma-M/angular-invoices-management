import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { uid } from 'uid';
import { StoreService } from '../../services/store';
import { InvoiceStatus } from '../../enums/invoice-status';
import { Invoice, InvoiceListItem } from '../../interfaces/invoice';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoice-form.html',
  styleUrls: ['./invoice-form.scss'],
})
export class InvoiceForm implements OnInit, OnDestroy {
  private _formBuilder = inject(FormBuilder);
  private _store = inject(StoreService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _datePipe = new DatePipe('en-GB');
  private _destroy$ = new Subject();
  private _snackBar = inject(MatSnackBar);
  invoiceStatus = InvoiceStatus;
  invoiceForm!: FormGroup;
  editInvoice = signal(false);
  currentInvoice = signal<Invoice | null>(null);

  get invoiceItemList(): FormArray {
    return this.invoiceForm.get('invoiceItemList') as FormArray;
  }

  ngOnInit(): void {
    this.initForm();
    this.setPaymentDueDate();

    const invoiceId: string = this._activatedRoute.snapshot.paramMap.get('invoiceId') || '';
    if (invoiceId) {
      this.editInvoice.set(true);
      this.handleSelectedInvoice(invoiceId);
    }
  }

  /**
   * @description method for init invoice form
   * @returns void
   */
  initForm(): void {
    this.invoiceForm = this._formBuilder.group({
      billerStreetAddress: ['', Validators.required],
      billerCity: ['', Validators.required],
      billerZipCode: ['', Validators.required],
      billerCountry: ['', Validators.required],
      clientName: ['', Validators.required],
      clientEmail: ['', [Validators.required, Validators.email]],
      clientStreetAddress: ['', Validators.required],
      clientCity: ['', Validators.required],
      clientZipCode: ['', Validators.required],
      clientCountry: ['', Validators.required],
      invoiceDate: [{ value: this._datePipe.transform(new Date(), 'dd/MM/yyyy'), disabled: true }],
      paymentTerms: ['', Validators.required],
      paymentDueDate: [{ value: '', disabled: true }],
      productDescription: ['', Validators.required],
      invoiceItemList: this._formBuilder.array([]),
    });
  }

  /**
   * @description method to setup payment due date depending on payment terms
   * @returns void
   */
  setPaymentDueDate(): void {
    this.invoiceForm
      .get('paymentTerms')
      ?.valueChanges.pipe(takeUntil(this._destroy$))
      .pipe(takeUntil(this._destroy$))
      .subscribe((days: string) => {
        const future = new Date();
        const due = future.setDate(future.getDate() + parseInt(days, 10));
        this.invoiceForm.patchValue(
          { paymentDueDate: this._datePipe.transform(due, 'dd/MM/yyyy') },
          { emitEvent: false }
        );
      });
  }

  /**
   * @description method to patch invoice data to form
   * @returns void
   */
  handleSelectedInvoice(invoiceId: string): void {
    this.currentInvoice.set(this._store.getInvoiceData(invoiceId));
    const invoice = this.currentInvoice();
    if (invoice) {
      this.invoiceForm.patchValue({
        ...invoice,
        invoiceItemList: [],
      });

      invoice.invoiceItemList.forEach((item: InvoiceListItem) => {
        const group = this._formBuilder.group({
          id: [item.id],
          itemName: [item.itemName],
          qty: [item.qty],
          price: [item.price],
          total: [item.total],
        });

        group.valueChanges.pipe(takeUntil(this._destroy$)).subscribe((val) => {
          const qty = val.qty || 0;
          const price = val.price || 0;
          const total = +qty * +price;
          group.patchValue({ total }, { emitEvent: false });
        });

        this.invoiceItemList.push(group);
      });
    }
  }

  /**
   * @description method to add new item to form
   * @returns void
   */
  onAddItem(): void {
    const group = this._formBuilder.group({
      id: uid(),
      itemName: '',
      qty: 0,
      price: 0,
      total: 0,
    });

    group.valueChanges.pipe(takeUntil(this._destroy$)).subscribe((val) => {
      const qty = val.qty || 0;
      const price = val.price || 0;
      const total = +qty * +price;
      group.patchValue({ total }, { emitEvent: false });
    });

    this.invoiceItemList.push(group);
  }

  /**
   * @description method to remove item from form
   * @param {number} index
   * @returns void
   */
  onRemoveItem(index: number): void {
    this.invoiceItemList.removeAt(index);
  }

  /**
   * @description method to calculate total
   * @returns number
   */
  calcTotal(): number {
    return this.invoiceItemList.controls.reduce((acc, ctrl) => {
      const qty = ctrl.get('qty')?.value || 0;
      const price = ctrl.get('price')?.value || 0;
      const total = qty * price;
      ctrl.patchValue({ total }, { emitEvent: false });
      return acc + total;
    }, 0);
  }

  /**
   * @description method to submit form
   * @param InvoiceStatus form status that user want to save the invoice with
   * @returns void
   */
  onSubmit(status?: InvoiceStatus): void {
    if (this.invoiceForm.invalid) return;
    const createInvoiceData = {
      ...this.invoiceForm.getRawValue(),
      invoiceId: uid(6),
      invoiceTotal: this.calcTotal(),
      invoicePending: !this.editInvoice() && status !== InvoiceStatus.Draft,
      invoiceDraft: status === InvoiceStatus.Draft,
      invoicePaid: false,
    };

    const updateInvoiceData = {
      ...this.invoiceForm.getRawValue(),
      invoiceId: uid(6),
      invoiceTotal: this.calcTotal(),
      invoicePending: this.currentInvoice()?.invoicePending,
      invoiceDraft: this.currentInvoice()?.invoiceDraft,
      invoicePaid: false,
    };

    if (this.editInvoice()) {
      this.updateInvoice(updateInvoiceData);
    } else {
      this.createInvoice(createInvoiceData);
    }
  }

  /**
   * @description method to update invoice
   * @param invoiceData
   * @returns void
   */
  updateInvoice(invoiceData: Invoice): void {
    this._store
      .updateInvoice(this.currentInvoice()!.docId, invoiceData)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this._snackBar.open('Invoice updated successfully!', 'Close', {
            duration: 10000,
          });
        },
        error: (err: Error) => {
          this._snackBar.open(err.message, 'Close', {
            duration: 10000,
          });
        },
        complete: () => {
          this._router.navigate(['../']);
        },
      });
  }

  /**
   * @description method to create new invoice
   * @param invoiceData
   * @returns void
   */
  createInvoice(invoiceData: Invoice): void {
    this._store
      .createInvoice(invoiceData)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this._snackBar.open('Invoice added successfully!', 'Close', {
            duration: 10000,
          });
        },
        error: (err: Error) => {
          this._snackBar.open(err.message, 'Close', {
            duration: 10000,
          });
        },
        complete: () => {
          this._router.navigate(['../']);
        },
      });
  }

  /**
   * @description method to cancel the process of create/update invoice
   * @returns void
   */
  onCancel(): void {
    this._router.navigate(['../']);
  }

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }
}

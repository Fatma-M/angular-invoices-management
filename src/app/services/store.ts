import { Injectable, signal } from '@angular/core';
import { from, map, Observable, take } from 'rxjs';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import db from '../firebase/firebaseinit';
import { Invoice } from '../interfaces/invoice';
import { InvoiceStatus } from '../enums/invoice-status';
import { uid } from 'uid';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  invoicesData = signal<Invoice[] | []>([]);

  constructor() {}

  /**
   * @description method for get all invoices from firebase collection
   * @returns {Observable<Invoices[]>} list of invoices
   */
  getInvoices(): Observable<Invoice[]> {
    const invoicesCollection = collection(db, 'invoices');

    return from(getDocs(invoicesCollection)).pipe(
      take(1),
      map((querySnapshot) => {
        const invoices: Invoice[] = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as Invoice),
          docId: doc.id,
        }));

        this.invoicesData.set(invoices);
        return invoices;
      })
    );
  }

  /**
   * @description method for get single invoice data by id
   * @param {string} invoiceId
   * @returns {Invoice | null} single invoice data
   */
  getInvoiceData(invoiceId: string): Invoice | null {
    return this.invoicesData().find((invoice: Invoice) => invoice.invoiceId === invoiceId) || null;
  }

  /**
   * @description method to handle when invoice status changes
   * @param {string} docId
   * @param {InvoiceStatus} selectedStatus
   * @returns {Observable<void>} firebase endpoint returns nothing when it's successful
   */
  changeInvoiceStatus(docId: string, selectedStatus: InvoiceStatus): Observable<void> {
    const dataBase = doc(db, 'invoices', docId);

    return from(
      updateDoc(dataBase, {
        invoicePending: selectedStatus === InvoiceStatus.Pending ? true : false,
        invoicePaid: selectedStatus === InvoiceStatus.Paid ? true : false,
        invoiceDraft: false,
      })
    ).pipe(take(1));
  }

  /**
   * @description method to handle create new invoice
   * @param invoiceData
   * @returns any - firebase return a special type for their endpoints
   */
  createInvoice(invoiceData: Invoice): Observable<any> {
    const invoicesCollection = collection(db, 'invoices');

    return from(
      addDoc(invoicesCollection, {
        ...invoiceData,
        invoiceId: uid(6),
        invoicePaid: null,
      })
    ).pipe(take(1));
  }

  /**
   * @description method to handle update invoice
   * @param {string} docId
   * @param invoiceData
   * @returns {Observable<void>} firebase endpoint returns nothing when it's successful
   */
  updateInvoice(docId: string, invoiceData: Invoice): Observable<void> {
    const invoiceRef = doc(db, 'invoices', docId);
    return from(updateDoc(invoiceRef, { ...invoiceData })).pipe(take(1));
  }

  /**
   * @description method to handle delete invoice
   * @param {string} docId
   * @returns {Observable<void>} firebase endpoint returns nothing when it's successful
   */
  deleteInvoice(docId: string): Observable<void> {
    return from(deleteDoc(doc(db, 'invoices', docId))).pipe(take(1));
  }
}

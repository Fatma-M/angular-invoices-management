import { Injectable } from '@angular/core';
import { from, map, Observable, take } from 'rxjs';
import { collection, getDocs } from 'firebase/firestore';
import db from '../firebase/firebaseinit';
import { Invoice } from '../interfaces/invoice';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  invoiceData: Invoice[] = [];

  constructor() {}

  /**
   * @description method for get all invoices from firebase collection
   * @returns {Observable<Invoices[]>} list of invoices
   */
  getInvoices(): Observable<Invoice[]> {
    const invoicesCollection = collection(db, 'invoices');

    return from(getDocs(invoicesCollection)).pipe(
      take(1),
      map((querySnapshot) => querySnapshot.docs.map((doc) => doc.data() as Invoice))
    );
  }
}

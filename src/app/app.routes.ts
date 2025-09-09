import { Routes } from '@angular/router';
import { InvoiceList } from './pages/invoice-list/invoice-list';

export const routes: Routes = [
  {
    path: '',
    component: InvoiceList,
  },
  {
    path: 'invoice/new',
    loadComponent: () => import('./pages/invoice-form/invoice-form').then((m) => m.InvoiceForm),
  },
  {
    path: 'invoice/edit/:invoiceId',
    loadComponent: () => import('./pages/invoice-form/invoice-form').then((m) => m.InvoiceForm),
  },
  {
    path: 'invoice/:invoiceId',
    loadComponent: () => import('./pages/invoice-view/invoice-view').then((m) => m.InvoiceView),
  },
];

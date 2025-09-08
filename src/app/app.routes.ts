import { Routes } from '@angular/router';
import { InvoiceList } from './pages/invoice-list/invoice-list';

export const routes: Routes = [
  {
    path: '',
    component: InvoiceList,
  },
  {
    path: 'invoice/:invoiceId',
    loadComponent: () => import('./pages/invoice-view/invoice-view').then((m) => m.InvoiceView),
  },
];

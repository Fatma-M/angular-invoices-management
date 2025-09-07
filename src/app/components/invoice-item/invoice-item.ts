import { Component, Input } from '@angular/core';
import { Invoice } from '../../interfaces/invoice';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-item.html',
  styleUrl: './invoice-item.scss',
})
export class InvoiceItem {
  @Input({ required: true }) invoice!: Invoice;
}

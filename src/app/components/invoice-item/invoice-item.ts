import { Component, Input } from '@angular/core';
import { Invoice } from '../../interfaces/invoice';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-invoice-item',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './invoice-item.html',
  styleUrl: './invoice-item.scss',
})
export class InvoiceItem {
  @Input({ required: true }) invoice!: Invoice;
}

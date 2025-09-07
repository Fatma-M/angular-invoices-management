import { Component, OnInit, signal } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar';
import { InvoiceList } from './pages/invoice-list/invoice-list';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, InvoiceList],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  mobile = signal(false);

  ngOnInit(): void {
    window.addEventListener('resize', () => this.onCheckScreen());
    this.onCheckScreen();
  }

  /**
   * @description method for check screen size
   * @returns void
   */
  onCheckScreen(): void {
    this.mobile.set(window.innerWidth < 768);
  }
}

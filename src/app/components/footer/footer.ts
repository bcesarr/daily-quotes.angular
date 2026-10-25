import { Component, inject } from '@angular/core';
import { VisitCounter } from '../../services/site-status/visitCounter';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly visitCounter = inject(VisitCounter);
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [],
  templateUrl: './start.html',
  styleUrl: './start.css'
})
export class Start {

  constructor(
    private router: Router
  ) {}

  goTo() {
    this.router.navigate(['web/register']);
  }
}

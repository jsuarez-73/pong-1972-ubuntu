import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Game } from './game/game';
import { NotFound } from './not-found/not-found';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    //Game,
    //NotFound
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Pong web';
}

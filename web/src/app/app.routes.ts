import { Routes } from '@angular/router';
import { Game } from './game/game';
import { NotFound } from './not-found/not-found';
import { Start } from './start/start';
import { Register } from './register/register';
import { Login } from './login/login';

export const routes: Routes = [

  { path: '', redirectTo: '/web', pathMatch: 'full' },

  {
    path: 'web',
    children: [
      {
        path: '',
        component: Start
      },
      {
        path: 'register',
        component: Register
      },
      {
        path: 'login',
        component: Login
      },
      {
        path: 'game',
        component: Game
      },
      {
        path: '**',
        component: NotFound
      }
    ]
  },

  /* [!NOTE] The order is important, Angular routes read from top to bottom, for
   * this reason the below path is the last one.
   */
  { path: '**', component: NotFound },
];

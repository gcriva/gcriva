import { Routes } from '@angular/router';
import { NoContentComponent } from './no-content';

import { HomeComponent } from './pages/home';
import { AboutComponent } from './pages/about';
import { LoginComponent } from './pages/login';
import { ResetPasswordComponent } from './pages/reset-password';

import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '',      component: HomeComponent },
  { path: 'home',  component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'detail', loadChildren: './+detail#DetailModule'},
  { path: 'barrel', loadChildren: './+barrel#BarrelModule'},
  { path: 'login', component: LoginComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: '**',    component: NoContentComponent },
];

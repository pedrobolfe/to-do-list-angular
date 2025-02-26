import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home-page/home-page.component').then(m => m.HomePageComponent),
  },
  {
    path: 'tarefa/:id',
    loadComponent: () => import('./components/tarefa/tarefa.component').then(m => m.TarefaComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: '**',
    redirectTo: '',
  }
];

export default routes;

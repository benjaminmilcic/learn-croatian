import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'learn',
    pathMatch: 'full',
  },
  {
    path: 'learn',
    loadComponent: () =>
      import('./pages/learn/learn.page').then((m) => m.LearnPage),
  },
  {
    path: 'quiz',
    loadComponent: () =>
      import('./pages/quiz/quiz.page').then((m) => m.QuizPage),
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./pages/list/list.page').then((m) => m.ListPage),
  },
];

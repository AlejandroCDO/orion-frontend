import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DataService } from '../services/data-service';

// Guard para rutas que requieren estar logueado
export const authGuard: CanActivateFn = () => {
  const dataService = inject(DataService);
  const router = inject(Router);

  if (dataService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

// Guard para rutas exclusivas del admin
export const adminGuard: CanActivateFn = () => {
  const dataService = inject(DataService);
  const router = inject(Router);

  if (dataService.isLoggedIn() && dataService.getRole() === 'admin') {
    return true;
  }

  router.navigate(['/inicio']);
  return false;
};

// Guard para rutas exclusivas del cliente
export const clientGuard: CanActivateFn = () => {
  const dataService = inject(DataService);
  const router = inject(Router);

  if (dataService.isLoggedIn() && dataService.getRole() === 'client') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

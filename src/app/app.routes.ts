import { Routes } from '@angular/router';
import { authGuard, adminGuard, clientGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio.page').then(m => m.InicioPage),
    canActivate: [authGuard],
  },
  {
    path: 'detalle-pelicula/:id',
    loadComponent: () => import('./pages/detalle-pelicula/detalle-pelicula.page').then(m => m.DetallePeliculaPage),
    canActivate: [authGuard],
  },
  {
    path: 'entradas/:sessionId',
    loadComponent: () => import('./pages/entradas/entradas.page').then(m => m.EntradasPage),
    canActivate: [clientGuard],
  },
  {
    path: 'butacas/:sessionId',
    loadComponent: () => import('./pages/butacas/butacas.page').then(m => m.ButacasPage),
    canActivate: [clientGuard],
  },
  {
    path: 'pago',
    loadComponent: () => import('./pages/pago/pago.page').then(m => m.PagoPage),
    canActivate: [clientGuard],
  },
  {
    path: 'mis-reservas',
    loadComponent: () => import('./pages/mis-reservas/mis-reservas.page').then(m => m.MisReservasPage),
    canActivate: [clientGuard],
  },
  {
    path: 'admin-inicio',
    loadComponent: () => import('./pages/admin-inicio/admin-inicio.page').then(m => m.AdminInicioPage),
    canActivate: [adminGuard],
  },
  {
    path: 'admin-anadir',
    loadComponent: () => import('./pages/admin-anadir/admin-anadir.page').then(m => m.AdminAnadirPage),
    canActivate: [adminGuard],
  },
  {
    path: 'admin-editar/:id',
    loadComponent: () => import('./pages/admin-editar/admin-editar.page').then(m => m.AdminEditarPage),
    canActivate: [adminGuard],
  },
  {
    path: 'admin-anadir-sesion',
    loadComponent: () => import('./pages/admin-anadir-sesion/admin-anadir-sesion.page').then(m => m.AdminAnadirSesionPage),
    canActivate: [adminGuard],
  },
  {
    path: 'favs',
    loadComponent: () => import('./pages/favs/favs.page').then(m => m.FavsPage),
    canActivate: [clientGuard]
  },
  {
    path: 'watchlist',
    loadComponent: () => import('./pages/watchlist/watchlist.page').then(m => m.WatchlistPage),
    canActivate: [clientGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage),
    canActivate: [authGuard]
  },
  {
    path: 'admin-usuarios',
    loadComponent: () => import('./pages/admin-usuarios/admin-usuarios.page').then(m => m.AdminUsuariosPage),
    canActivate: [adminGuard],
  },
  {
    path: 'admin-sesiones',
    loadComponent: () => import('./pages/admin-sesiones/admin-sesiones.page').then(m => m.AdminSesionesPage),
    canActivate: [adminGuard],
  },
  {
    path: 'mis-resenas',
    loadComponent: () => import('./pages/mis-resenas/mis-resenas.page').then(m => m.MisResenasPage),
    canActivate: [clientGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

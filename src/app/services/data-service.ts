import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponsePeliculas,
  ApiResponseUnaPelicula,
  ApiResponseLogin,
  ApiResponseRegister,
} from '../common/interfaces';
import {SessionService} from "./session.service";

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly urlBase: string = 'http://localhost:3000/api/v2';
  private readonly sessionService = inject(SessionService);

  // ─── HELPERS ───────────────────────────────────────────
  // Genera el header con el token JWT para rutas protegidas
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ─── AUTH ───────────────────────────────────────────────
  login(email: string, password: string, accessCode?: string): Observable<ApiResponseLogin> {
    const body: any = { email, password };
    if (accessCode) body.accessCode = accessCode;
    return this.http.post<ApiResponseLogin>(`${this.urlBase}/auth/login`, body);
  }

  register(email: string, password: string, nombre: string, apellidos: string, telefono?: string): Observable<ApiResponseRegister> {
    return this.http.post<ApiResponseRegister>(
      `${this.urlBase}/auth/register`,
      { email, password, nombre, apellidos, telefono }
    );
  }

  logout(): void {
    this.sessionService.clearSession();
  }

  isLoggedIn(): boolean {
    return this.sessionService.isLoggedIn();
  }

  getRole(): string {
    return this.sessionService.getRole();
  }

  // ─── PELÍCULAS ──────────────────────────────────────────
  getPeliculasData(): Observable<ApiResponsePeliculas> {
    return this.http.get<ApiResponsePeliculas>(`${this.urlBase}/peliculas`);
  }

  getPeliculaById(id: string): Observable<ApiResponseUnaPelicula> {
    return this.http.get<ApiResponseUnaPelicula>(`${this.urlBase}/peliculas/unaPelicula/${id}`);
  }

  crearReserva(body: any): Observable<any> {
    return this.http.post<any>(
      `${this.urlBase}/reservas/crear`,
      body,
      { headers: this.getAuthHeaders() }
    );
  }

  // ─── FAVS ────────────────────────────────────────────────
  getFavs(userId: string): Observable<any> {
    return this.http.get<any>(
      `${this.urlBase}/users/${userId}/favs`,
      { headers: this.getAuthHeaders() }
    );
  }

  toggleFav(userId: string, peliculaId: string): Observable<any> {
    return this.http.post<any>(
      `${this.urlBase}/users/${userId}/favs/${peliculaId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

// ─── WATCHLIST ───────────────────────────────────────────
  getWatchlist(userId: string): Observable<any> {
    return this.http.get<any>(
      `${this.urlBase}/users/${userId}/watchlist`,
      { headers: this.getAuthHeaders() }
    );
  }

  toggleWatchlist(userId: string, peliculaId: string): Observable<any> {
    return this.http.post<any>(
      `${this.urlBase}/users/${userId}/watchlist/${peliculaId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // ─── SESIONES ───────────────────────────────────
  getSessionesByPelicula(movieId: string): Observable<any> {
    return this.http.get<any>(`${this.urlBase}/sessions/pelicula/${movieId}`);
  }

  getSessionById(sessionId: string): Observable<any> {
    return this.http.get<any>(`${this.urlBase}/sessions/${sessionId}`);
  }

  getMisReservas(usuarioId: string): Observable<any> {
    return this.http.get<any>(
      `${this.urlBase}/reservas/usuario/${usuarioId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ─── RESERVAS ───────────────────────────────────
  cancelarReserva(reservaId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.urlBase}/reservas/cancelar/${reservaId}`,
      { headers: this.getAuthHeaders() }
    );
  }
  // ─── ADMIN ───────────────────────────────────
  deletePelicula(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.urlBase}/peliculas/delete/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  addPelicula(pelicula: any): Observable<any> {
    return this.http.post<any>(
      `${this.urlBase}/peliculas/agregar`,
      pelicula,
      { headers: this.getAuthHeaders() }
    );
  }

  updatePelicula(id: string, pelicula: any): Observable<any> {
    return this.http.put<any>(
      `${this.urlBase}/peliculas/update/${id}`,
      pelicula,
      { headers: this.getAuthHeaders() }
    );
  }

  addSesion(sesion: any): Observable<any> {
    return this.http.post<any>(
      `${this.urlBase}/sessions/crear`,
      sesion,
      { headers: this.getAuthHeaders() }
    );
  }

  // ─── PERFIL ───────────────────────────────────
  getPerfil(userId: string): Observable<any> {
    return this.http.get<any>(`${this.urlBase}/users/${userId}/perfil`, { headers: this.getAuthHeaders() });
  }

  updatePerfil(userId: string, perfil: any): Observable<any> {
    return this.http.put<any>(`${this.urlBase}/users/${userId}/perfil`, perfil, { headers: this.getAuthHeaders() });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}/users/${userId}`, { headers: this.getAuthHeaders() });
  }

  cambiarPassword(userId: string, passwordActual: string, passwordNueva: string): Observable<any> {
    return this.http.put<any>(
      `${this.urlBase}/users/${userId}/password`,
      { passwordActual, passwordNueva },
      { headers: this.getAuthHeaders() }
    );
  }

  // ─── VALORACIONES ────────────────────────────────────────
  getValoraciones(peliculaId: string): Observable<any> {
    return this.http.get<any>(`${this.urlBase}/valoraciones/${peliculaId}`);
  }

  getMiValoracion(peliculaId: string, userId: string): Observable<any> {
    return this.http.get<any>(
      `${this.urlBase}/valoraciones/${peliculaId}/mia/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  crearOActualizarValoracion(peliculaId: string, userId: string, puntuacion: number, comentario: string): Observable<any> {
    return this.http.post<any>(
      `${this.urlBase}/valoraciones/${peliculaId}/${userId}`,
      { puntuacion, comentario },
      { headers: this.getAuthHeaders() }
    );
  }

  eliminarValoracion(peliculaId: string, userId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.urlBase}/valoraciones/${peliculaId}/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getMisValoraciones(userId: string): Observable<any> {
    return this.http.get<any>(
      `${this.urlBase}/users/${userId}/valoraciones`,
      { headers: this.getAuthHeaders() }
    );
  }
  // ─── ADMIN USUARIOS ──────────────────────────────────────
  getAllUsuarios(): Observable<any> {
    return this.http.get<any>(
      `${this.urlBase}/users`,
      { headers: this.getAuthHeaders() }
    );
  }

  getValoracionesUsuario(userId: string): Observable<any> {
    return this.http.get<any>(
      `${this.urlBase}/users/${userId}/valoraciones`,
      { headers: this.getAuthHeaders() }
    );
  }

  eliminarValoracionAdmin(peliculaId: string, userId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.urlBase}/valoraciones/${peliculaId}/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ─── ADMIN SESIONES ──────────────────────────────────────
  getAllSesiones(): Observable<any> {
    return this.http.get<any>(
      `${this.urlBase}/sessions`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateSesion(id: string, sesion: any): Observable<any> {
    return this.http.put<any>(
      `${this.urlBase}/sessions/update/${id}`,
      sesion,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteSesion(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.urlBase}/sessions/delete/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private roleSubject = new BehaviorSubject<string>(localStorage.getItem('role') || '');
  private emailSubject = new BehaviorSubject<string>(localStorage.getItem('email') || '');

  role$ = this.roleSubject.asObservable();
  email$ = this.emailSubject.asObservable();

  setSession(token: string, role: string, email: string, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('email', email);
    localStorage.setItem('userId', userId);
    this.roleSubject.next(role);
    this.emailSubject.next(email);
  }

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    this.roleSubject.next('');
    this.emailSubject.next('');
  }

  getRole(): string {
    return this.roleSubject.value;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}

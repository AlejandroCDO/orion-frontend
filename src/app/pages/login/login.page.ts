import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonItem, IonLabel, IonInput,
  IonButton, IonCheckbox
} from '@ionic/angular/standalone';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import {SessionService} from "../../services/session.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonItem, IonLabel, IonInput,
    IonButton, IonCheckbox
  ],
})
export class LoginPage {
  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);

  email: string = '';
  password: string = '';
  accessCode: string = '';
  isAdmin: boolean = false;

  async login() {
    if (!this.email || !this.password) {
      await this.toastService.mostrarToast('Rellena todos los campos', 'warning');
      return;
    }

    if (this.isAdmin && !this.accessCode) {
      await this.toastService.mostrarToast('Introduce el código de acceso', 'warning');
      return;
    }

    this.dataService.login(
      this.email,
      this.password,
      this.isAdmin ? this.accessCode : undefined
    ).subscribe({
      next: (res) => {
        const payload = JSON.parse(atob(res.token.split('.')[1]));
        this.sessionService.setSession(
          res.token,
          res.role,
          this.email,
          payload.sub
        );

        if (res.role === 'admin') {
          this.router.navigate(['/admin-inicio']);
        } else {
          this.router.navigate(['/inicio']);
        }
      },
      error: async () => {
        await this.toastService.mostrarToast('Correo o contraseña incorrectos', 'danger');
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}

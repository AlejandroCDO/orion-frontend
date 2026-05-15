import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonItem, IonLabel, IonInput,
  IonButton, IonCheckbox, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonItem, IonLabel, IonInput,
    IonButton, IonCheckbox, IonIcon
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
  verPassword: boolean = false;
  verCodigo: boolean = false;

  errores = {
    email: false,
    password: false,
    accessCode: false,
  };

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  async login() {
    // Reset errores
    this.errores = { email: false, password: false, accessCode: false };

    let hayError = false;

    if (!this.email) {
      this.errores.email = true;
      hayError = true;
    }
    if (!this.password) {
      this.errores.password = true;
      hayError = true;
    }
    if (this.isAdmin && !this.accessCode) {
      this.errores.accessCode = true;
      hayError = true;
    }

    if (hayError) {
      await this.toastService.mostrarToast('Rellena todos los campos', 'warning');
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
      error: async (err) => {
        const msg = 'Correo o contraseña incorrectos';

        if (msg.includes('código') || msg.includes('acceso')) {
          this.errores.accessCode = true;
        } else {
          this.errores.email = true;
          this.errores.password = true;
        }

        await this.toastService.mostrarToast(msg, 'danger');
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonBackButton, IonButtons, IonToolbar, IonHeader } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline, arrowForwardOutline, arrowBackOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonIcon, IonBackButton, IonButtons, IonToolbar, IonHeader
  ],
})
export class RegisterPage {
  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  paso = 1;
  registrando = false;

  form = {
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  constructor() {
    addIcons({ checkmarkOutline, arrowForwardOutline, arrowBackOutline });
  }

  async siguientePaso() {
    if (!this.form.nombre.trim()) {
      await this.toastService.mostrarToast('El nombre es obligatorio', 'warning');
      return;
    }
    if (!this.form.apellidos.trim()) {
      await this.toastService.mostrarToast('Los apellidos son obligatorios', 'warning');
      return;
    }
    this.paso = 2;
  }

  pasoAnterior() {
    this.paso = 1;
  }

  async register() {
    if (!this.form.email.trim()) {
      await this.toastService.mostrarToast('El email es obligatorio', 'warning');
      return;
    }
    if (!this.form.password) {
      await this.toastService.mostrarToast('La contraseña es obligatoria', 'warning');
      return;
    }
    if (this.form.password.length < 6) {
      await this.toastService.mostrarToast('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }
    if (this.form.password !== this.form.confirmPassword) {
      await this.toastService.mostrarToast('Las contraseñas no coinciden', 'danger');
      return;
    }

    this.registrando = true;
    this.dataService.register(
      this.form.email,
      this.form.password,
      this.form.nombre,
      this.form.apellidos,
      this.form.telefono
    ).subscribe({
      next: async () => {
        await this.toastService.mostrarToast('Cuenta creada correctamente', 'success');
        this.router.navigate(['/login']);
      },
      error: async (err) => {
        const msg = err?.error?.message || 'Error al registrarse';
        await this.toastService.mostrarToast(msg, 'danger');
        this.registrando = false;
      }
    });
  }
}

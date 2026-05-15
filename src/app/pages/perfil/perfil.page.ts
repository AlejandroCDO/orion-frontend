import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, callOutline, mailOutline, lockClosedOutline, trashOutline, createOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, HeaderComponent],
})
export class PerfilPage implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);

  cargando = true;
  guardando = false;

  perfil = {
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
  };

  perfilOriginal = { ...this.perfil };

  editando: string | null = null;

  constructor() {
    addIcons({ personOutline, callOutline, mailOutline, lockClosedOutline,
      trashOutline, createOutline, checkmarkOutline, closeOutline });
  }

  ngOnInit() {
    this.cargarPerfil();
  }

  private cargarPerfil() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    this.cargando = true;
    this.dataService.getPerfil(userId).subscribe({
      next: (data) => {
        this.perfil = {
          nombre: data.perfil.nombre || '',
          apellidos: data.perfil.apellidos || '',
          telefono: data.perfil.telefono || '',
          email: data.perfil.email || '',
        };
        this.perfilOriginal = { ...this.perfil };
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  editarCampo(campo: string) {
    this.perfilOriginal = { ...this.perfil };
    this.editando = campo;
  }

  cancelarEdicion() {
    this.perfil = { ...this.perfilOriginal };
    this.editando = null;
  }

  guardarCampo() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // Validaciones por campo
    if (this.editando === 'nombre' && !this.perfil.nombre.trim()) {
      this.toastService.mostrarToast('El nombre no puede estar vacío', 'warning');
      return;
    }
    if (this.editando === 'apellidos' && !this.perfil.apellidos.trim()) {
      this.toastService.mostrarToast('Los apellidos no pueden estar vacíos', 'warning');
      return;
    }
    if (this.editando === 'email' && !this.perfil.email.trim()) {
      this.toastService.mostrarToast('El email no puede estar vacío', 'warning');
      return;
    }
    if (this.editando === 'email' && !this.perfil.email.includes('@')) {
      this.toastService.mostrarToast('El email no tiene un formato válido', 'warning');
      return;
    }

    this.guardando = true;
    this.dataService.updatePerfil(userId, this.perfil).subscribe({
      next: async (data) => {
        this.perfil = {
          nombre: data.perfil.nombre || '',
          apellidos: data.perfil.apellidos || '',
          telefono: data.perfil.telefono || '',
          email: data.perfil.email || '',
        };
        this.perfilOriginal = { ...this.perfil };
        this.editando = null;
        this.guardando = false;
        await this.toastService.mostrarToast('Perfil actualizado', 'success');
      },
      error: async (err) => {
        const msg = err?.error?.message || 'Error al actualizar';
        await this.toastService.mostrarToast(msg, 'danger');
        this.guardando = false;
      }
    });
  }

  async eliminarCuenta() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar cuenta',
      message: '¿Estás seguro? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.confirmarEliminacion()
        }
      ]
    });
    await alert.present();
  }

  private confirmarEliminacion() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    this.dataService.deleteUser(userId).subscribe({
      next: async () => {
        this.dataService.logout();
        await this.toastService.mostrarToast('Cuenta eliminada', 'success');
        this.router.navigate(['/login']);
      },
      error: async () => {
        await this.toastService.mostrarToast('Error al eliminar la cuenta', 'danger');
      }
    });
  }

  async abrirCambioPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar contraseña',
      inputs: [
        {
          name: 'passwordActual',
          type: 'password',
          placeholder: 'Contraseña actual',
        },
        {
          name: 'passwordNueva',
          type: 'password',
          placeholder: 'Nueva contraseña',
        },
        {
          name: 'passwordConfirm',
          type: 'password',
          placeholder: 'Repite la nueva contraseña',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.passwordActual || !data.passwordNueva || !data.passwordConfirm) {
              await this.toastService.mostrarToast('Rellena todos los campos', 'warning');
              return false;
            }
            if (data.passwordNueva !== data.passwordConfirm) {
              await this.toastService.mostrarToast('Las contraseñas no coinciden', 'danger');
              return false;
            }
            if (data.passwordNueva.length < 6) {
              await this.toastService.mostrarToast('Mínimo 6 caracteres', 'warning');
              return false;
            }

            const userId = localStorage.getItem('userId');
            if (!userId) return false;

            this.dataService.cambiarPassword(userId, data.passwordActual, data.passwordNueva).subscribe({
              next: async () => {
                await this.toastService.mostrarToast('Contraseña actualizada', 'success');
              },
              error: async (err) => {
                const msg = err?.error?.message || 'Error al cambiar la contraseña';
                await this.toastService.mostrarToast(msg, 'danger');
              }
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline, star, trashOutline, createOutline,
  checkmarkOutline, closeOutline, filmOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-mis-resenas',
  templateUrl: './mis-resenas.page.html',
  styleUrls: ['./mis-resenas.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, HeaderComponent],
})
export class MisResenasPage implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);

  valoraciones: any[] = [];
  cargando = true;
  editandoId: string | null = null;
  guardando = false;

  formEdicion = {
    puntuacion: 0,
    comentario: '',
  };
  estrellaHover = 0;
  readonly estrellas = [1, 2, 3, 4, 5];

  constructor() {
    addIcons({ starOutline, star, trashOutline, createOutline,
      checkmarkOutline, closeOutline, filmOutline });
  }

  ngOnInit() {
    this.cargarResenas();
  }

  private cargarResenas() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    this.cargando = true;
    this.dataService.getMisValoraciones(userId).subscribe({
      next: (data) => {
        this.valoraciones = data.valoraciones;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  abrirEdicion(v: any) {
    this.editandoId = v._id;
    this.formEdicion = {
      puntuacion: v.puntuacion,
      comentario: v.comentario || '',
    };
    this.estrellaHover = 0;
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.estrellaHover = 0;
  }

  guardarEdicion(v: any) {
    if (!this.formEdicion.puntuacion) {
      this.toastService.mostrarToast('Selecciona una puntuación', 'warning');
      return;
    }
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.guardando = true;
    this.dataService.crearOActualizarValoracion(
      v.peliculaId._id,
      userId,
      this.formEdicion.puntuacion,
      this.formEdicion.comentario
    ).subscribe({
      next: async () => {
        await this.toastService.mostrarToast('Reseña actualizada', 'success');
        this.editandoId = null;
        this.guardando = false;
        this.cargarResenas();
      },
      error: async (err) => {
        const msg = err?.error?.message || 'Error al actualizar';
        await this.toastService.mostrarToast(msg, 'danger');
        this.guardando = false;
      }
    });
  }

  async eliminar(v: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar reseña',
      message: `¿Seguro que quieres eliminar tu reseña de "${v.peliculaId?.titulo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            const userId = localStorage.getItem('userId');
            if (!userId) return;
            this.dataService.eliminarValoracion(v.peliculaId._id, userId).subscribe({
              next: async () => {
                await this.toastService.mostrarToast('Reseña eliminada', 'success');
                this.cargarResenas();
              },
              error: async () => {
                await this.toastService.mostrarToast('Error al eliminar', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  verPelicula(peliculaId: string) {
    this.router.navigate(['/detalle-pelicula', peliculaId]);
  }
}

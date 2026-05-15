import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon, IonSearchbar, IonHeader, IonToolbar,
  IonTitle, IonButtons, IonMenuButton, AlertController, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, trashOutline, chevronDownOutline,
  chevronUpOutline, starOutline, star, mailOutline, callOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.page.html',
  styleUrls: ['./admin-usuarios.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon,
    IonSearchbar, HeaderComponent, IonRefresher, IonRefresherContent],
})
export class AdminUsuariosPage {
  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);

  usuarios: any[] = [];
  textoBuscar: string = '';
  usuarioExpandido: string | null = null;
  valoracionesCache: { [userId: string]: any[] } = {};
  cargando = true;
  readonly estrellas = [1, 2, 3, 4, 5];

  constructor() {
    addIcons({ personOutline, trashOutline, chevronDownOutline,
      chevronUpOutline, starOutline, star, mailOutline, callOutline });
  }

  ionViewWillEnter() {
    this.cargarUsuarios()
  }

  get usuariosFiltrados(): any[] {
    if (!this.textoBuscar.trim()) return this.usuarios;
    const texto = this.textoBuscar.toLowerCase();
    return this.usuarios.filter(u =>
      u.email?.toLowerCase().includes(texto) ||
      u.nombre?.toLowerCase().includes(texto) ||
      u.apellidos?.toLowerCase().includes(texto)
    );
  }

  private cargarUsuarios() {
    this.cargando = true;
    this.dataService.getAllUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data.usuarios;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }
  recargar(event: any) {
    this.cargarUsuarios();
    setTimeout(() => event.target.complete(), 1000);
  }
  buscar(event: any) {
    this.textoBuscar = event.detail.value;
  }

  toggleUsuario(userId: string) {
    if (this.usuarioExpandido === userId) {
      this.usuarioExpandido = null;
      return;
    }
    this.usuarioExpandido = userId;
    if (!this.valoracionesCache[userId]) {
      this.cargarValoraciones(userId);
    }
  }

  private cargarValoraciones(userId: string) {
    this.dataService.getValoracionesUsuario(userId).subscribe({
      next: (data) => {
        this.valoracionesCache[userId] = data.valoraciones;
      },
      error: (err) => console.error(err)
    });
  }

  async eliminarUsuario(usuario: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar usuario',
      message: `¿Seguro que quieres eliminar a ${usuario.email}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.dataService.deleteUser(usuario._id).subscribe({
              next: async () => {
                await this.toastService.mostrarToast('Usuario eliminado', 'success');
                this.cargarUsuarios();
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

  async eliminarValoracion(valoracion: any, userId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar reseña',
      message: `¿Seguro que quieres eliminar esta reseña?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.dataService.eliminarValoracionAdmin(
              valoracion.peliculaId._id, userId
            ).subscribe({
              next: async () => {
                await this.toastService.mostrarToast('Reseña eliminada', 'success');
                delete this.valoracionesCache[userId];
                this.cargarValoraciones(userId);
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

  getNombre(u: any): string {
    if (u.nombre) return `${u.nombre} ${u.apellidos || ''}`.trim();
    return u.email;
  }
}

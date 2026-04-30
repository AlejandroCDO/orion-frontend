import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonSearchbar, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, locationOutline, timeOutline,
  createOutline, trashOutline, filmOutline,
  chevronDownOutline, chevronUpOutline,
  addOutline, closeOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import { FiltroPipe } from '../../pipes/filtro-pipe';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-admin-sesiones',
  templateUrl: './admin-sesiones.page.html',
  styleUrls: ['./admin-sesiones.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon,
    IonSearchbar, FiltroPipe, HeaderComponent],
})
export class AdminSesionesPage implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);
  private readonly alertCtrl = inject(AlertController);

  sesiones: any[] = [];
  textoBuscar: string = '';
  sesionExpandida: string | null = null;
  cargando = true;

  // Formulario edición
  editando: string | null = null;
  form: any = {};
  horaInput: string = '';
  guardando = false;

  constructor() {
    addIcons({ calendarOutline, locationOutline, timeOutline,
      createOutline, trashOutline, filmOutline,
      chevronDownOutline, chevronUpOutline,
      addOutline, closeOutline });
  }

  ngOnInit() {
    this.cargarSesiones();
  }

  private cargarSesiones() {
    this.cargando = true;
    this.dataService.getAllSesiones().subscribe({
      next: (data) => {
        this.sesiones = data.message;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  buscar(event: any) {
    this.textoBuscar = event.detail.value;
  }

  toggleSesion(sesionId: string) {
    this.sesionExpandida = this.sesionExpandida === sesionId ? null : sesionId;
    this.editando = null;
  }

  abrirEdicion(sesion: any) {
    this.editando = sesion._id;
    this.form = {
      sala: sesion.sala,
      fecha: sesion.fecha?.split('T')[0],
      hora: [...sesion.hora],
      precio: { ...sesion.precio },
    };
  }

  cancelarEdicion() {
    this.editando = null;
    this.form = {};
  }

  addHora() {
    if (!this.horaInput) return;
    if (this.form.hora.includes(this.horaInput)) {
      this.toastService.mostrarToast('Esa hora ya está añadida', 'warning');
      return;
    }
    this.form.hora.push(this.horaInput);
    this.form.hora.sort();
    this.horaInput = '';
  }

  removeHora(hora: string) {
    this.form.hora = this.form.hora.filter((h: string) => h !== hora);
  }

  async guardarEdicion(sesionId: string) {
    if (!this.form.sala?.trim()) {
      await this.toastService.mostrarToast('La sala es obligatoria', 'warning');
      return;
    }
    if (!this.form.fecha) {
      await this.toastService.mostrarToast('La fecha es obligatoria', 'warning');
      return;
    }
    if (this.form.hora.length === 0) {
      await this.toastService.mostrarToast('Añade al menos un horario', 'warning');
      return;
    }

    this.guardando = true;
    this.dataService.updateSesion(sesionId, this.form).subscribe({
      next: async () => {
        await this.toastService.mostrarToast('Sesión actualizada', 'success');
        this.editando = null;
        this.guardando = false;
        this.cargarSesiones();
      },
      error: async (err) => {
        const msg = 'Error al actualizar';
        await this.toastService.mostrarToast(msg, 'danger');
        this.guardando = false;
      }
    });
  }

  async eliminarSesion(sesion: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar sesión',
      message: `¿Seguro que quieres eliminar esta sesión de "${sesion.movieId?.titulo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.dataService.deleteSesion(sesion._id).subscribe({
              next: async () => {
                await this.toastService.mostrarToast('Sesión eliminada', 'success');
                this.sesionExpandida = null;
                this.cargarSesiones();
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

  formatearFecha(fechaISO: string): string {
    if (!fechaISO) return '';
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const d = new Date(fechaISO);
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {IonContent, IonIcon, AlertController, IonRefresher, IonRefresherContent} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ticketOutline, timeOutline, locationOutline,
  trashOutline, filmOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-mis-reservas',
  templateUrl: './mis-reservas.page.html',
  styleUrls: ['./mis-reservas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, HeaderComponent, IonRefresher, IonRefresherContent],
})
export class MisReservasPage implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);

  reservas: any[] = [];
  historial: any[] = [];
  cargando: boolean = true;

  constructor() {
    addIcons({ ticketOutline, timeOutline, locationOutline,
      trashOutline, filmOutline });
  }

  ngOnInit() {
    this.cargarReservas();
  }

  ionViewWillEnter() {
    this.cargarReservas();
  }

  private cargarReservas() {
    const usuarioId = localStorage.getItem('userId');
    if (!usuarioId) return;

    this.cargando = true;
    this.dataService.getMisReservas(usuarioId).subscribe({
      next: (data) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        this.reservas = data.reservas.filter((r: any) => {
          const fechaSesion = new Date(r.sesionId?.fecha);
          return fechaSesion >= hoy;
        });

        this.historial = data.reservas.filter((r: any) => {
          const fechaSesion = new Date(r.sesionId?.fecha);
          return fechaSesion < hoy;
        });

        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  recargar(event: any) {
    this.cargarReservas();
    setTimeout(() => event.target.complete(), 1000);
  }

  async cancelar(reservaId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Cancelar reserva',
      message: '¿Estás seguro de que quieres cancelar esta entrada?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí, cancelar',
          role: 'destructive',
          handler: () => this.confirmarCancelacion(reservaId)
        }
      ]
    });
    await alert.present();
  }

  private confirmarCancelacion(reservaId: string) {
    this.dataService.cancelarReserva(reservaId).subscribe({
      next: async () => {
        await this.toastService.mostrarToast('Reserva cancelada', 'success');
        this.cargarReservas();
      },
      error: async () => {
        await this.toastService.mostrarToast('Error al cancelar', 'danger');
      }
    });
  }

  irAInicio() {
    this.router.navigate(['/inicio']);
  }

  formatearFecha(fechaISO: string): string {
    if (!fechaISO) return '';
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles',
      'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fecha = new Date(fechaISO);
    return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]}`;
  }

  formatearFechaCorta(fechaISO: string): string {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
  }
}

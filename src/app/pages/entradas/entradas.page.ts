import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonFooter, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, removeOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import { HeaderComponent } from '../../components/header/header.component';

interface TipoEntrada {
  nombre: string;
  precio: number;
  cantidad: number;
}

@Component({
  selector: 'app-entradas',
  templateUrl: './entradas.page.html',
  styleUrls: ['./entradas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonFooter, IonIcon, HeaderComponent],
})
export class EntradasPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);

  sala: string = '';
  sesion: any = null;
  horaSeleccionada: string = '';
  fechaFormateada: string = '';

  tiposEntrada: TipoEntrada[] = [
    { nombre: 'Adulto',   precio: 7.90, cantidad: 0 },
    { nombre: 'Reducida', precio: 6.50, cantidad: 0 },
    { nombre: 'Jubilado', precio: 5.90, cantidad: 0 },
  ];

  constructor() {
    addIcons({ addOutline, removeOutline });
  }

  ngOnInit() {
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    this.horaSeleccionada = this.route.snapshot.queryParams['hora'] ?? '';
    this.sala = this.route.snapshot.queryParams['sala'] ?? '';

    if (sessionId) {
      this.dataService.getSessionById(sessionId).subscribe({
        next: (data) => {
          this.sesion = data.session;
          this.fechaFormateada = this.formatearFecha(data.session.fecha);
        },
        error: (err) => console.error(err)
      });
    }
  }

  get totalEntradas(): number {
    return this.tiposEntrada.reduce((sum, e) => sum + e.cantidad, 0);
  }

  get totalPrecio(): number {
    return this.tiposEntrada.reduce((sum, e) => sum + e.precio * e.cantidad, 0);
  }

  incrementar(entrada: TipoEntrada) {
    if (this.totalEntradas < 10) entrada.cantidad++;
  }

  decrementar(entrada: TipoEntrada) {
    if (entrada.cantidad > 0) entrada.cantidad--;
  }

  async siguiente() {
    if (this.totalEntradas === 0) {
      await this.toastService.mostrarToast('Selecciona al menos una entrada', 'warning');
      return;
    }
    this.router.navigate(['/butacas', this.sesion._id], {
      queryParams: {
        hora: this.horaSeleccionada,
        sala: this.sala,
        entradas: JSON.stringify(this.tiposEntrada.filter(e => e.cantidad > 0))
      }
    });
  }

  private formatearFecha(fechaISO: string): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fecha = new Date(fechaISO);
    return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]}`;
  }
}
